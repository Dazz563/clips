import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot} from "@angular/fire/compat/firestore";
import firebase from "firebase/compat/app";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFireStorage, AngularFireUploadTask} from "@angular/fire/compat/storage";
import {BehaviorSubject, combineLatest, lastValueFrom, map, of, switchMap} from "rxjs";
import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";

export class ClipModel {
    docId?: string;
    uid: string;
    displayName: string;
    title: string;
    fileName: string;
    url: string;
    screenshotURL: string;
    timestamp: firebase.firestore.FieldValue;
    screenshotFileName: string;
}

@Injectable({
    providedIn: "root",
})
export class ClipService implements Resolve<ClipModel | null> {
    clipsCollection: AngularFirestoreCollection<ClipModel>;
    pageClips: ClipModel[] = [];
    pendingReq = false;

    constructor(
        private db: AngularFirestore, //
        private auth: AngularFireAuth,
        private storage: AngularFireStorage,
        private router: Router
    ) {
        this.clipsCollection = db.collection("clips");
    }

    createClip(data: ClipModel): Promise<DocumentReference<ClipModel>> {
        return this.clipsCollection.add(data);
    }

    getUserClips(sort$: BehaviorSubject<string>) {
        // Start by retrieving the user
        return combineLatest([this.auth.user, sort$]).pipe(
            // switchMap from user to the document
            switchMap((values) => {
                const [user, sort] = values;
                if (!user) {
                    return of([]);
                }
                const query = this.clipsCollection.ref
                    .where(
                        "uid",
                        "==",
                        user.uid //
                    )
                    .orderBy("timestamp", sort == "1" ? "desc" : "asc");

                return query.get();
            }),
            map((snapshot) => (snapshot as QuerySnapshot<ClipModel>).docs)
        );
    }

    updateClip(id: string, title: string) {
        return this.clipsCollection.doc(id).update({
            title,
        });
    }

    async deleteClip(clip: ClipModel) {
        // Create ref for deletion
        const clipRef = this.storage.ref(`clips/${clip.fileName}`);
        const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFileName}`);
        // Delete clip from storage
        await clipRef.delete();
        await screenshotRef.delete();

        // Delete clip from DB
        await this.clipsCollection.doc(clip.docId).delete();
    }

    // INFINITE SCROLL with Firebase
    async getClips() {
        if (this.pendingReq) {
            return;
        }

        this.pendingReq = true;
        let query = this.clipsCollection.ref //
            .orderBy("timestamp", "desc")
            .limit(6);

        const {length} = this.pageClips;

        if (length) {
            const lastDocId = this.pageClips[length - 1].docId;
            const lastDoc = await lastValueFrom(this.clipsCollection.doc(lastDocId).get());

            query = query.startAfter(lastDoc);
        }
        const snapshot = await query.get();

        snapshot.forEach((doc) => {
            this.pageClips.push({
                docId: doc.id,
                ...doc.data(),
            });
        });
        console.log("pageclips: ", this.pageClips);

        this.pendingReq = false;
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.clipsCollection
            .doc(route.params.id)
            .get()
            .pipe(
                map((snapshot) => {
                    const data = snapshot.data();

                    if (!data) {
                        this.router.navigate(["/"]);
                        return null;
                    }

                    return data;
                })
            );
    }
}

import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot} from "@angular/fire/compat/firestore";
import firebase from "firebase/compat/app";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFireStorage, AngularFireUploadTask} from "@angular/fire/compat/storage";
import {BehaviorSubject, combineLatest, map, of, switchMap} from "rxjs";

export class ClipModel {
    docId?: string;
    uid: string;
    displayName: string;
    title: string;
    fileName: string;
    url: string;
    timestamp: firebase.firestore.FieldValue;
}

@Injectable({
    providedIn: "root",
})
export class ClipService {
    clipsCollection: AngularFirestoreCollection<ClipModel>;

    constructor(
        private db: AngularFirestore, //
        private auth: AngularFireAuth,
        private storage: AngularFireStorage
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
        // Delete clip from storage
        const clipRef = this.storage.ref(`clips/${clip.fileName}`);
        await clipRef.delete();

        // Delete clip from DB
        await this.clipsCollection.doc(clip.docId).delete();
    }
}

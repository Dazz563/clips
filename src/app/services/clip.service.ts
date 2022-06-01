import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot} from "@angular/fire/compat/firestore";
import firebase from "firebase/compat/app";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFireStorage, AngularFireUploadTask} from "@angular/fire/compat/storage";
import {map, of, switchMap} from "rxjs";

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

    getUserClips() {
        // Start by retrieving the user
        return this.auth.user.pipe(
            // switchMap from user to the document
            switchMap((user) => {
                if (!user) {
                    return of([]);
                }
                const query = this.clipsCollection.ref.where("uid", "==", user.uid);

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

import {Component, OnDestroy, OnInit} from "@angular/core";
import {AngularFireStorage, AngularFireUploadTask} from "@angular/fire/compat/storage";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {last, switchMap} from "rxjs/operators";
import {v4 as uuid} from "uuid";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from "firebase/compat/app";
import {ClipService} from "src/app/services/clip.service";
import {Router} from "@angular/router";

@Component({
    selector: "app-upload",
    templateUrl: "./upload.component.html",
    styleUrls: ["./upload.component.scss"],
})
export class UploadComponent implements OnDestroy {
    isDragOver = false;
    file: File | null = null;
    nextStep = false;

    // Alert
    showAlert = false;
    alertColor = "blue";
    alertMsg = "Please wait! Your clip is being uploaded";
    inSubmission = false;
    // Upload Progress
    task?: AngularFireUploadTask;
    percentage = 0;
    showPercentage = false;
    // User info
    user: firebase.User | null = null;

    uploadForm = new FormGroup({
        title: new FormControl("", {
            validators: [Validators.required, Validators.minLength(3)],
        }),
    });

    constructor(
        private storage: AngularFireStorage, //
        private auth: AngularFireAuth,
        private clipsService: ClipService,
        private router: Router
    ) {
        // We need the user in the construtor immediatly before the upload can be completed
        auth.user.subscribe((user) => (this.user = user));
    }

    ngOnDestroy(): void {
        // Cancels the upload if the user navigates away from the component
        this.task?.cancel();
    }

    storeFile($event: Event) {
        this.isDragOver = false;

        // Selects the file from the drag/input event
        this.file = ($event as DragEvent).dataTransfer //
            ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null //
            : ($event.target as HTMLInputElement).files?.item(0) ?? null;
        // Checks for correct file format
        if (!this.file || this.file.type !== "video/mp4") {
            return;
        }
        console.log(this.file);
        // Set the forms value and removes the files extension from the name
        this.uploadForm.get("title").setValue(this.file.name.replace(/\.[^/.]+$/, ""));
        // Shows form after correct file has been detected
        this.nextStep = true;
    }

    uploadFile() {
        // Disable form (in the case the title is empty or has errors)
        this.uploadForm.disable();
        // Alert (we resubmit the value in case it fails)
        this.showAlert = true;
        this.alertColor = "blue";
        this.alertMsg = "Please wait! Your clip is being uploaded";
        this.inSubmission = true;
        this.showPercentage = true;

        // Create file name for DB
        const clipFileName = uuid();
        const clipPath = `clips/${clipFileName}.mp4`;
        // Send file to FB
        this.task = this.storage.upload(clipPath, this.file);
        // Video URL
        const clipRef = this.storage.ref(clipPath);
        // Upload progress
        this.task.percentageChanges().subscribe((progress) => {
            this.percentage = (progress as number) / 100;
        });
        this.task
            .snapshotChanges()
            .pipe(
                last(), //
                switchMap(() => clipRef.getDownloadURL())
            )
            .subscribe({
                next: async (url) => {
                    const clip = {
                        uid: this.user?.uid,
                        displayName: this.user?.displayName,
                        title: this.uploadForm.value.title,
                        fileName: `${clipFileName}.mp4`,
                        url,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    };
                    console.log(clip);
                    // Storing the clip to the DB
                    const clipDocRef = await this.clipsService.createClip(clip);

                    // Alert
                    this.alertColor = "green";
                    this.alertMsg = "Success! Your clip is now ready to share with the world";
                    this.showPercentage = false;

                    // Allows the user to see the success message
                    setTimeout(() => {
                        this.router.navigate(["clip", clipDocRef.id]);
                    }, 1000);
                },
                error: (error) => {
                    // Enable form (in the case the title is empty or has errors for the user to retry)
                    this.uploadForm.enable();
                    // Alert
                    this.alertColor = "red";
                    this.alertMsg = "Upload failed! Please try again later.";
                    this.showPercentage = false;
                    this.inSubmission = true;
                    this.showPercentage = false;
                    console.error(error);
                },
            });
    }
}

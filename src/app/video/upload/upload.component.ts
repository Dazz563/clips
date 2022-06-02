import {Component, OnDestroy, OnInit} from "@angular/core";
import {AngularFireStorage, AngularFireUploadTask} from "@angular/fire/compat/storage";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {switchMap} from "rxjs/operators";
import {v4 as uuid} from "uuid";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from "firebase/compat/app";
import {ClipService} from "src/app/services/clip.service";
import {Router} from "@angular/router";
import {FfmpegService} from "src/app/services/ffmpeg.service";
import {combineLatest, forkJoin} from "rxjs";

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
    // Upload Video Progress
    task?: AngularFireUploadTask;
    percentage = 0;
    showPercentage = false;
    //Upload picture
    screenshotTask?: AngularFireUploadTask;
    // User info
    user: firebase.User | null = null;
    // Screenshots
    screenshots: string[] = [];
    selectedScreenshot = "";

    uploadForm = new FormGroup({
        title: new FormControl("", {
            validators: [Validators.required, Validators.minLength(3)],
        }),
    });

    constructor(
        private storage: AngularFireStorage, //
        private auth: AngularFireAuth,
        private clipsService: ClipService,
        private router: Router,
        public ffmpegService: FfmpegService
    ) {
        // We need the user in the construtor immediatly before the upload can be completed
        auth.user.subscribe((user) => (this.user = user));
        // Calling the init function, package is large and needs to happen ASAP
        this.ffmpegService.init();
    }

    ngOnDestroy(): void {
        // Cancels the upload if the user navigates away from the component
        this.task?.cancel();
    }

    async storeFile($event: Event) {
        if (this.ffmpegService.isRunning) {
            return;
        }
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
        // ffmpeg service to get screen shots
        this.screenshots = await this.ffmpegService.getScreenshots(this.file);
        // Update selected screenshot
        this.selectedScreenshot = this.screenshots[0];
        // Set the forms value and removes the files extension from the name
        this.uploadForm.get("title").setValue(this.file.name.replace(/\.[^/.]+$/, ""));
        // Shows form after correct file has been detected
        this.nextStep = true;
    }

    async uploadFile() {
        // Disable form (in the case the title is empty or has errors)
        this.uploadForm.disable();
        // Alert (we resubmit the value in case it fails)
        this.showAlert = true;
        this.alertColor = "blue";
        this.alertMsg = "Please wait! Your clip is being uploaded";
        this.inSubmission = true;
        this.showPercentage = true;

        // Create video file name for DB
        const clipFileName = uuid();
        const clipPath = `clips/${clipFileName}.mp4`;
        // Creating Blob to send to firebase on picture select
        const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot);
        const screenshotPath = `screenshots/${clipFileName}.png`;

        this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
        const screenshotRef = this.storage.ref(screenshotPath);
        // Send file to FB
        this.task = this.storage.upload(clipPath, this.file);
        // Video URL
        const clipRef = this.storage.ref(clipPath);
        // Upload progress
        combineLatest([
            this.task.percentageChanges(), //
            this.screenshotTask.percentageChanges(),
        ]).subscribe((progress) => {
            const [clipProgress, screenshotProgress] = progress;

            if (!clipProgress || !screenshotProgress) {
                return;
            }
            const total = clipProgress + screenshotProgress;
            this.percentage = (total as number) / 200;
        });
        forkJoin([this.task.snapshotChanges(), this.screenshotTask.snapshotChanges()])
            .pipe(
                switchMap(() =>
                    forkJoin([
                        clipRef.getDownloadURL(), //
                        screenshotRef.getDownloadURL(),
                    ])
                )
            )
            .subscribe({
                next: async (urls) => {
                    const [clipURL, screenshotURL] = urls;
                    const clip = {
                        uid: this.user?.uid,
                        displayName: this.user?.displayName,
                        title: this.uploadForm.value.title,
                        fileName: `${clipFileName}.mp4`,
                        url: clipURL,
                        screenshotURL,
                        screenshotFileName: `${clipFileName}.png`,
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

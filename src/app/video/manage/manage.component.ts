import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {ClipModel, ClipService} from "src/app/services/clip.service";
import {ModalService} from "src/app/services/modal.service";

@Component({
    selector: "app-manage",
    templateUrl: "./manage.component.html",
    styleUrls: ["./manage.component.scss"],
})
export class ManageComponent implements OnInit {
    videoOrder = "1";
    clips: ClipModel[] = [];
    activeClip: ClipModel | null = null;

    // Tracks the sort order from recent to oldest
    sort$ = new BehaviorSubject<string>(this.videoOrder);

    constructor(
        private router: Router, //
        private route: ActivatedRoute,
        private clipsService: ClipService,
        private modal: ModalService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params: Params) => {
            this.videoOrder = params.sort === "2" ? params.sort : "1";
            this.sort$.next(this.videoOrder);
        });
        this.clipsService.getUserClips(this.sort$).subscribe((docs) => {
            this.clips = [];

            docs.forEach((doc) => {
                this.clips.push({
                    docId: doc.id,
                    ...doc.data(),
                });
            });
        });
    }

    sort(event: Event) {
        const {value} = event.target as HTMLSelectElement;

        this.router.navigateByUrl(`/manage?sort=${value}`);
    }

    openModal($event: Event, clip: ClipModel) {
        // Prevents the href from redirecting
        $event.preventDefault();
        // Assign the passed through clip to member variable for input communication
        this.activeClip = clip;

        this.modal.toggleModal("editClip");
    }

    update($event: ClipModel) {
        this.clips.forEach((element, index) => {
            // Checking against the docId set up from the child and re-assigning it
            if (element.docId == $event.docId) {
                this.clips[index].title = $event.title;
            }
        });
    }

    deleteClip($event: Event, clip: ClipModel) {
        $event.preventDefault();

        this.clipsService.deleteClip(clip);

        this.clips.forEach((element, index) => {
            // Checking against the docId set up from the child and re-assigning it
            if (element.docId == clip.docId) {
                this.clips.splice(index, 1);
            }
        });
    }

    async copyToClipboard($event: MouseEvent, docId: string | undefined) {
        $event.preventDefault();

        if (!docId) {
            return;
        }

        const url = `${location.origin}/clip/${docId}`;

        await navigator.clipboard.writeText(url);

        alert("Link Copied");
    }
}

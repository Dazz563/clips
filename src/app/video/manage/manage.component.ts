import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
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

    constructor(
        private router: Router, //
        private route: ActivatedRoute,
        private clipsService: ClipService,
        private modal: ModalService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params: Params) => {
            this.videoOrder = params.sort === "2" ? params.sort : "1";
        });
        this.clipsService.getUserClips().subscribe((docs) => {
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
}

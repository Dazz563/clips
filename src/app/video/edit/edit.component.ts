import {Component, Input, OnChanges, OnDestroy, OnInit, Output, EventEmitter} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ClipModel, ClipService} from "src/app/services/clip.service";
import {ModalService} from "src/app/services/modal.service";

@Component({
    selector: "app-edit",
    templateUrl: "./edit.component.html",
    styleUrls: ["./edit.component.scss"],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
    @Input() activeClip: ClipModel | null = null;
    // Alert
    inSubmission = false;
    showAlert = false;
    alertColor = "blue";
    alertMsg = "Please wait! Updating clip";
    // Form
    editForm = new FormGroup({
        clipId: new FormControl(""),
        title: new FormControl("", {
            validators: [Validators.required, Validators.minLength(3)],
        }),
    });
    // Updating parent to reflect updates
    @Output() update = new EventEmitter();

    constructor(
        private modal: ModalService, //
        private clipsService: ClipService
    ) {}

    // This will check if the input is empty and on change will update the forms value
    ngOnChanges() {
        if (!this.activeClip) {
            return;
        }
        this.editForm.controls.clipId.setValue(this.activeClip.docId);
        this.editForm.controls.title.setValue(this.activeClip.title);
    }

    ngOnInit(): void {
        this.modal.register("editClip");
    }

    async submit() {
        // Safety in case the activeClip is empty
        if (!this.activeClip) {
            return;
        }
        // Alert
        this.inSubmission = true;
        this.showAlert = true;
        this.alertColor = "blue";
        this.alertMsg = "Please wait! Updating clip";

        // Updating through service
        try {
            await this.clipsService.updateClip(this.editForm.value.clipId, this.editForm.value.title);
        } catch (error) {
            // Alert
            this.inSubmission = false;
            this.alertColor = "red";
            this.alertMsg = "Something went wrong. Try again later";
            return;
        }

        // Alert
        this.inSubmission = false;
        this.alertColor = "green";
        this.alertMsg = "Success";

        // Emit update to parent
        this.activeClip.title = this.editForm.value.title;
        this.update.emit(this.activeClip);
    }

    ngOnDestroy(): void {
        this.modal.unregister("editClip");
    }
}

import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ClipModel} from "src/app/services/clip.service";
import {ModalService} from "src/app/services/modal.service";

@Component({
    selector: "app-edit",
    templateUrl: "./edit.component.html",
    styleUrls: ["./edit.component.scss"],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
    @Input() activeClip: ClipModel | null = null;

    editForm = new FormGroup({
        clipId: new FormControl(""),
        title: new FormControl("", {
            validators: [Validators.required, Validators.minLength(3)],
        }),
    });

    constructor(
        private modal: ModalService //
    ) {}

    // This will check if the input is empty and on change will update the forms value
    ngOnChanges(changes: SimpleChanges): void {
        if (!this.activeClip) {
            return;
        }
    }

    ngOnInit(): void {
        this.modal.register("editClip");
    }

    ngOnDestroy(): void {
        this.modal.unregister("editClip");
    }
}

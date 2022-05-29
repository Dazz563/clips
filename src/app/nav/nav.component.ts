import {Component, OnInit} from "@angular/core";
import {ModalService} from "../services/modal.service";

@Component({
    selector: "app-nav",
    templateUrl: "./nav.component.html",
    styleUrls: ["./nav.component.scss"],
})
export class NavComponent implements OnInit {
    constructor(public modal: ModalService) {}

    ngOnInit(): void {}

    openModal($event: Event) {
        // Prevents the href from redirecting the anchor tag
        $event.preventDefault();

        this.modal.toggleModal("auth");
    }
}

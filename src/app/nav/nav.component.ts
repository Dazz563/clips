import {Component, OnInit} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {ModalService} from "../services/modal.service";

@Component({
    selector: "app-nav",
    templateUrl: "./nav.component.html",
    styleUrls: ["./nav.component.scss"],
})
export class NavComponent implements OnInit {
    constructor(
        public modal: ModalService, //
        public auth: AuthService
    ) {}

    ngOnInit(): void {}

    openModal($event: Event) {
        // Prevents the href from redirecting the anchor tag
        $event.preventDefault();

        this.modal.toggleModal("auth");
    }

    logout($event: Event) {
        // Prevents anchor tags href from trying to redirect
        $event.preventDefault();
        // Logs user out
        this.auth.logout();
    }
}

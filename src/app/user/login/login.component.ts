import {Component, OnInit} from "@angular/core";
import {AuthService} from "src/app/services/auth.service";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
    credentials = {
        email: "",
        password: "",
    };
    showAlert = false;
    alertMsg = "Please wait we are logging you in!";
    alertColor = "blue";
    inSubmission = false;

    constructor(
        private auth: AuthService //
    ) {}

    ngOnInit(): void {}

    async login() {
        this.showAlert = true;
        this.alertMsg = "Please wait we are logging you in!";
        this.alertColor = "blue";
        this.inSubmission = true;

        try {
            let result = await this.auth.login(
                this.credentials.email, //
                this.credentials.password
            );
        } catch (err) {
            this.inSubmission = false;
            this.alertMsg = "An unexpected error occured. Please try again later";
            this.alertColor = "red";

            return;
        }

        this.alertMsg = "Success you are now logged in";
        this.alertColor = "green";
    }
}

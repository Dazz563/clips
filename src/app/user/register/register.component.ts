import {Component, OnInit} from "@angular/core";
import {EmailValidator, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "src/app/services/auth.service";
import {EmailTaken} from "../validators/email-taken";
import {RegisterValidators} from "../validators/register-validators";

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
    showAlert = false;
    alertMsg = "Please wait! Your account is being created!";
    alertColor = "blue";
    inSubmission = false;

    constructor(
        private auth: AuthService, //
        private emailTaken: EmailTaken
    ) {}

    registerForm = new FormGroup(
        {
            name: new FormControl("", {
                validators: [Validators.required, Validators.minLength(3)],
            }),
            email: new FormControl("", {
                validators: [Validators.required, Validators.email],
                asyncValidators: [this.emailTaken.validate],
            }),
            // email: new FormControl("", [this.emailTaken.validate], [this.emailTaken.validate]),
            age: new FormControl("", {
                validators: [Validators.required, Validators.min(18), Validators.max(120)],
            }),
            password: new FormControl("", {
                validators: [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)],
            }),
            confirm_password: new FormControl("", {
                validators: [Validators.required],
            }),
            phone_number: new FormControl("", {
                validators: [Validators.required, Validators.minLength(13), Validators.maxLength(13)],
            }),
        },
        [RegisterValidators.match("password", "confirm_password")]
    );
    ngOnInit(): void {}

    async register() {
        this.showAlert = true;
        this.alertMsg = "Please wait! Your account is being created!";
        this.alertColor = "blue";
        this.inSubmission = true;

        try {
            await this.auth.createUser(this.registerForm.value);
        } catch (err) {
            console.error(err);
            this.alertMsg = "An unexpected error occured. Please try again later";
            this.alertColor = "red";
            this.inSubmission = false;
            return;
        }

        this.alertMsg = "Success! Your account has been created.";
        this.alertColor = "green";
    }
}

import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
    showAlert = false;
    alertMsg = "Please wait! Your account is being created!";
    alertColor = "blue";

    registerForm = new FormGroup({
        name: new FormControl("", {
            validators: [Validators.required, Validators.minLength(3)],
        }),
        email: new FormControl("", {
            validators: [Validators.required, Validators.email],
        }),
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
    });
    ngOnInit(): void {}

    register() {
        this.showAlert = true;
        this.alertMsg = "Please wait! Your account is being created!";
        this.alertColor = "blue";
    }
}
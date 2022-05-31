import {ValidationErrors, AbstractControl, ValidatorFn} from "@angular/forms";

export class RegisterValidators {
    static match(controlName: string, matchingControlname: string): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const control = group.get(controlName);
            const matchingControl = group.get(matchingControlname);

            if (!control || !matchingControl) {
                console.error("Form controls can not be found in the form group");
                return {
                    controlNotFound: false,
                };
            }

            const error = control.value === matchingControl.value ? null : {noMatch: true};

            matchingControl.setErrors(error);

            return error;
        };
    }
}

// new RegisterValidators.match() => Without static
// RegisterValidators.match() => With static

// Static methods don't have access to an object properties or methods. Limited scope

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {UserRoutingModule} from "./user-routing.module";
import {AuthModalComponent} from "./auth-modal/auth-modal.component";

@NgModule({
    declarations: [AuthModalComponent],
    imports: [CommonModule, UserRoutingModule],
    exports: [AuthModalComponent],
})
export class UserModule {}

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {UserRoutingModule} from "./user-routing.module";
import {AuthModalComponent} from "./auth-modal/auth-modal.component";
import {SharedModule} from "../shared/shared.module";

@NgModule({
    declarations: [AuthModalComponent],
    imports: [CommonModule, UserRoutingModule, SharedModule],
    exports: [AuthModalComponent],
})
export class UserModule {}

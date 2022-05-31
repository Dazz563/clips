import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {VideoRoutingModule} from "./video.routing";
import { ManageComponent } from './manage/manage.component';
import { UploadComponent } from './upload/upload.component';

@NgModule({
    declarations: [
    ManageComponent,
    UploadComponent
  ],
    imports: [CommonModule, VideoRoutingModule],
})
export class VideoModule {}

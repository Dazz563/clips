import {DatePipe} from "@angular/common";
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {ClipModel} from "../services/clip.service";

@Component({
    selector: "app-clip",
    templateUrl: "./clip.component.html",
    styleUrls: ["./clip.component.scss"],
    providers: [DatePipe],
})
export class ClipComponent implements OnInit {
    // id = "";
    clip?: ClipModel;
    // @ViewChild("videoPlayer", {static: true}) target?: ElementRef;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.data.subscribe((data) => {
            this.clip = data.clip as ClipModel;
        });
    }
}

import {Component, OnDestroy, OnInit} from "@angular/core";
import {ClipService} from "../services/clip.service";

@Component({
    selector: "app-clips-list",
    templateUrl: "./clips-list.component.html",
    styleUrls: ["./clips-list.component.scss"],
})
export class ClipsListComponent implements OnInit, OnDestroy {
    constructor(public clipsService: ClipService) {
        this.clipsService.getClips();
    }

    ngOnInit(): void {
        window.addEventListener("scroll", this.handleScroll);
    }

    handleScroll = () => {
        // Getting variable to check for infinite scroll
        const {scrollTop, offsetHeight} = document.documentElement;
        const {innerHeight} = window;

        const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

        if (bottomOfWindow) {
            console.log("bottom of window");
            this.clipsService.getClips();
        }
    };

    ngOnDestroy(): void {
        window.removeEventListener("scroll", this.handleScroll);
    }
}

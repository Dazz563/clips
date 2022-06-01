import {Directive, HostListener} from "@angular/core";

// This directive prevents the broswers behavior of opening pictures in new tabs
@Directive({
    selector: "[app-event-blocker]",
})
export class EventBlockerDirective {
    @HostListener("drop", ["$event"])
    @HostListener("dragover", ["$event"])
    handleEvent(event: Event) {
        event.preventDefault();
    }
}

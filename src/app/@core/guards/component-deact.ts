import {Directive, HostListener} from "@angular/core";
@Directive({ selector: 'router-outlet' })
export abstract class ComponentCanDeactivate {
 
  abstract  canDeactivate(): boolean;
    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        $event.returnValue =!this.canDeactivate();
    }
}
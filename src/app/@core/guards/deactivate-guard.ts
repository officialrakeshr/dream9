import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ComponentCanDeactivate } from './component-deact';


@Injectable()
export class CanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(component: ComponentCanDeactivate): boolean {
    if(!component.canDeactivate()){
        if (confirm("You have made updates on this page but have not submitted the information. Are you sure you want to leave this page?")) {
            return true;
        } else {
            return false;
        }
    }
    return true;
  }
}
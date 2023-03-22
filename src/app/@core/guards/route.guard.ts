import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouteGuard implements CanActivate {
  constructor() {}
  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ){
    return sessionStorage.getItem('token') ? sessionStorage.getItem('token')!=undefined : false ;
  }
}

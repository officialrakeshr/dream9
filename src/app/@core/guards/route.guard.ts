import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouteGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ){
    if(sessionStorage.getItem('token')==undefined){
      this.router.navigate(['/login']);
      return false;
    }
    return sessionStorage.getItem('token') ? sessionStorage.getItem('token')!=undefined : false ;
  }
}

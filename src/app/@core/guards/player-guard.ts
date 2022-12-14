import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { UserService } from '../services/user/user.service';
 
 
@Injectable()
export class PlayerGuard implements CanActivate {
 
    constructor(private _router:Router, private api:UserService ) {
    }
 
    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> {
                    return this.api.userMatchAvailable().pipe(tap(o=>{
                        if(!o){
                            this._router.navigate(["/"]);
                        }
                    },()=>{
                        this._router.navigate(["/"]);
                    }));

    }
 
}
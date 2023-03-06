import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { map, Observable, of, tap } from 'rxjs';
import { ScoreService } from '../services/score/score.service';
import { UserService } from '../services/user/user.service';
 
 
@Injectable()
export class PlayerGuard implements CanActivate {
 
    constructor(private _router:Router, private api:UserService, private score: ScoreService, private route: ActivatedRoute ) {
    }
 
    canActivate(route: ActivatedRouteSnapshot, 
                state: RouterStateSnapshot): Observable<boolean> {             
                    if (state.url.indexOf('/playerDashboard') > -1) {
                        return this.score.getMatchDetailsByMatchNo(route.url[1].path).pipe(map(o=>o.enable11),tap(o=>{
                            if (!o) {
                                this._router.navigateByUrl('./fixture')
                            }
                        }))
                      }
                    return of(true)

    }
 
}
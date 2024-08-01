import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";
import { UserService } from "../services/user/user.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private api: UserService) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.api.adminAccess().pipe(
      map(() => true),
      catchError((_err) => {
        return of(false);
      })
    );
  }
}

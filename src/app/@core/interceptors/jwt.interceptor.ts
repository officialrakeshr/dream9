import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (sessionStorage.getItem('token')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
    }
    if (request.url.endsWith('api/auth/signin')) {
      return next.handle(request).pipe(
        tap(
          (evt) => {
            if (evt instanceof HttpResponse) {
              sessionStorage.setItem('token', evt.body?.accessToken);
            }
          },
          () => alert('Oops !!! Wrong credentials.')
        )
      );
    } else
      return next.handle(request).pipe(
        tap(
          (evt) => {},
          (err) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                sessionStorage.clear();
                this.router.navigateByUrl(`../login`);
                return of(err.message);
              }
              return of(err.message);
            }
            return err;
          }
        )
      );
  }

}

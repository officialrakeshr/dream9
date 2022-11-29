import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment'
import { TokenDetails } from '../../models/tokenDetails';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  public login(username:string,password:string):Observable<TokenDetails>{
    sessionStorage.removeItem("token");
    const headers = new HttpHeaders({'Content-Type' : 'application/json'});
    const options = {headers};
    return this.http.post<TokenDetails>(`${environment.baseUrl}/api/auth/signin`,{"username":username,"password":password}, options)
    .pipe(
      map((response: TokenDetails) => response),
      tap(r=>{
        sessionStorage.setItem("token",r.accessToken)
      })
   );
  }

}

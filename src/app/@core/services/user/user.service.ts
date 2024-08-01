import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import { TokenDetails } from "../../models/tokenDetails";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  public login(username: string, password: string): Observable<TokenDetails> {
    sessionStorage.removeItem("token");
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    const options = { headers };
    return this.http
      .post<TokenDetails>(
        `${environment.baseUrl}/api/auth/signin`,
        { username: username, password: password },
        options
      )
      .pipe(
        map((response: TokenDetails) => response),
        tap((r) => {
          sessionStorage.setItem("token", r.accessToken);
        })
      );
  }

  public adminAccess() {
    return this.http.get<boolean>(`${environment.baseUrl}/api/homekeep/admin`);
  }

  public employeeAccess() {
    return this.http.get<boolean>(`${environment.baseUrl}/api/homekeep/employee`);
  }

  public hasAdminRoles() {
    return this.http.get<boolean>(
      `${environment.baseUrl}/api/auth/hasAdminRole`
    );
  }

  public suAccess() {
    return this.http.get<boolean>(`${environment.baseUrl}/api/homekeep/superuser`);
  }

  public userMatchAvailable() {
    return this.http.get<boolean>(`${environment.baseUrl}/api/homekeep/userMatchAvailable`);
  }

  public isUniqueIdAvailable(code:string) {
    return this.http.get<boolean>(`${environment.baseUrl}/api/homekeep/isUniqueIdAvailable/${code}`);
  }
  public registerUser(data:any) {
    return this.http.post<boolean>(`${environment.baseUrl}/api/auth/signup`,data);
  }

  public attemptHack() {
    return this.http.get<boolean>(`${environment.baseUrl}/cricket/attemptHack`);
  }
}

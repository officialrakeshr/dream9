import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatchDetails, Player, Tournament } from '../../models/Player.model';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  updateMatchDetails(matchDetails: MatchDetails) {
    let  url = `${environment.baseUrl}/cricket/updateMatchDetails`
    return this.http.put<any>(url,matchDetails)
    .pipe(
      tap(() => alert("Success")),
   );
  }

  updateTournament(tournament: Tournament):Observable<Tournament> {
    let  url = `${environment.baseUrl}/cricket/updateTournament`
    return this.http.put<any>(url,tournament)
    .pipe(
      tap(() => alert("Success")),
   );
  }

  constructor(private http:HttpClient) { }
  public getPlayerList(team?:string):Observable<Player[]>{
    let url = ''
    if(team){
      url = `${environment.baseUrl}/cricket/players?team=${team}`
    }else url = `${environment.baseUrl}/cricket/players`
    return this.http.get<any>(url)
    .pipe(
      map((response: any) => response["players"]),
   );
  }

  public getTournaments():Observable<Tournament[]>{
    let  url = `${environment.baseUrl}/cricket/tournaments`
    return this.http.get<any>(url)
    .pipe(
      map((response: any) => response["tournaments"]),
   );
  }

  public getMatchDetails(matchNo:string):Observable<MatchDetails>{
    let  url = `${environment.baseUrl}/cricket/matchDetails?matchNo=${matchNo}`
    return this.http.get<any>(url).pipe( catchError(_err => {
      return of({} as any)
    }));
  }
}

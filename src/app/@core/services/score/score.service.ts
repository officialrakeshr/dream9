import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InningsSession, MatchDetails, Player, Team, Tournament } from '../../models/Player.model';
import { Points } from '../../models/points';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  public updateMatchDetails(matchDetails: MatchDetails) {
    let  url = `${environment.baseUrl}/cricket/updateMatchDetails`
    return this.http.put<any>(url,matchDetails)
    .pipe(
      tap(() => alert("Success")),
   );
  }

  public getDream9Details():Observable<Points> {
    let  url = `${environment.baseUrl}/cricket/getDream9Details`
    return this.http.get<Points>(url);
  }

  public findAllRank():Observable<Points> {
    let  url = `${environment.baseUrl}/cricket/findAllRankForPlayers`
    return this.http.get<Points>(url);
  }

  public findAllRankByMatchAdmin(matchNo:string):Observable<any> {
    let  url = `${environment.baseUrl}/cricket/findAllRankByMatch?matchNo=${matchNo}`
    return this.http.get<Points>(url);
  }

  public getActiveDream9Tournament():Observable<Tournament> {
    let  url = `${environment.baseUrl}/cricket/getActiveDream9Tournament`
    return this.http.get<any>(url);
  }

  public getStartedTournament():Observable<Tournament> {
    let  url = `${environment.baseUrl}/cricket/getStartedTournament`
    return this.http.get<any>(url);
  }

  public updateTournament(tournament: Tournament):Observable<Tournament> {
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
      map((response: any) => response["players"] as Player[]),
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

  public updateInningsSession(a:InningsSession):Observable<Boolean>{
    let  url = `${environment.baseUrl}/cricket/updateInningsSession`
    return this.http.post<Boolean>(url,a).pipe( catchError(_err => {
      return of({} as any)
    }));
  }

  public updateDream9Details(a:Points):Observable<Boolean>{
    let  url = `${environment.baseUrl}/cricket/updateDream9Details`
    return this.http.post<Boolean>(url,a).pipe( catchError(_err => {
      return of({} as any)
    }));
  }

  public getDream9playerConfig(matchNo:string):Observable<Player[]>{
    let  url = `${environment.baseUrl}/cricket/getDream9playerConfig/${matchNo}`;
    return this.http.get<Player[]>(url);
  }

  public userMatchDetails() {
    return this.http.get<Tournament>(`${environment.baseUrl}/api/homekeep/userMatchDetails`);
  }
  public getMatchDetailsByMatchNo(matchNo:string):Observable<Tournament> {
    return this.http.get<Tournament>(`${environment.baseUrl}/cricket/tournaments/${matchNo}`);
  }
  public createNewMatch(tournament:Tournament) {
    return this.http.post<Tournament>(`${environment.baseUrl}/cricket/createNewMatch`, tournament);
  }

  public listTeams() {
    return this.http.get<any>(`${environment.baseUrl}/cricket/teams`);
  }

}

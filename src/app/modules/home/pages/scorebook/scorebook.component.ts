import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { switchMap } from 'rxjs';
import { BattingSession, BowlingSession, MatchDetails, Player, Tournament } from 'src/app/@core/models/Player.model';
import { ScoreService } from 'src/app/@core/services/score/score.service';

@UntilDestroy({checkProperties:true})
@Component({
  selector: 'app-scorebook',
  templateUrl: './scorebook.component.html',
  styleUrls: ['./scorebook.component.scss']
})
export class ScorebookComponent implements OnInit {
  stateOptions = [{label: 'Off', value: 'off'}, {label: 'On', value: 'on'}];
  battingTeam = {} as any;
  battingDetailsTeam1:BattingSession[]=[];//Team 1 batting
  battingDetailsTeam2:BattingSession[]=[];//Team 2 batting
  bowlingDetailsTeam1:BowlingSession[]=[];//Team 1 batting
  bowlingDetailsTeam2:BowlingSession[]=[];//Team 2 batting
  matchDetails: MatchDetails | undefined;
  tournament: Tournament ={} as any;
  allPlayers:Player[]=[] as any;
  dummyPlayer:Player[]=[{
    name: '-Select-',
    active: null,
    team: null,
    id: null
  }] as any;
  constructor(private scoreService:ScoreService,private router: Router) { }
  yesOrNo=[{'name':'Yes','value':true},{'name':'No','value':false},{'name':'-Select-','value':null}]
  ngOnInit(): void {
    for(let i=0;i<9;i++){
      let dummyBattObj:BattingSession={
        batterName: null,
        runs: null,
        balls: null,
        fours: null,
        sixes: null,
        out: null,
        catchOrStumpedBy: null
      } as any;
      let dummyBowlerObj:BowlingSession={
        bowlerName: null,
        overs: null,
        dots: null,
        runs: null,
        wickets: null
      } as any;
      this.battingDetailsTeam1.push({...dummyBattObj});
      this.bowlingDetailsTeam1.push({...dummyBowlerObj});
      this.battingDetailsTeam2.push({...dummyBattObj});
      this.bowlingDetailsTeam2.push({...dummyBowlerObj});
    }
    this.scoreService.getStartedTournament().pipe(switchMap((o:Tournament)=>{
      this.tournament = o;
      this.stateOptions=[{label: o.team1, value: 'team1'}, {label: o.team2, value: 'team2'}];
      return this.scoreService.getMatchDetails(o.matchNo);
    })).subscribe(match=>{
      match.team1.players=[...this.dummyPlayer,...match.team1.players.filter(o=>o.active=='active')];
      match.team2.players=[...this.dummyPlayer,...match.team2.players.filter(o=>o.active=='active')];
      this.matchDetails = match;
    })
    
  }


  updateScore(battingTeam:string){
    let data = null;
    if(battingTeam=='team1'){
      data = {
        'match':this.tournament?.matchNo||'',
        'bowlingSession': this.bowlingDetailsTeam1.filter(o=>o.bowlerName!=null),
        'battingSession': this.battingDetailsTeam1.filter(o=>o.batterName!=null)
      }
    }else{
      data ={
        'match':this.tournament?.matchNo||'',
        'bowlingSession': this.bowlingDetailsTeam2.filter(o=>o.bowlerName!=null),
        'battingSession': this.battingDetailsTeam2.filter(o=>o.batterName!=null)
      }
    }
    this.scoreService.updateInningsSession(data).subscribe(o=>{
      alert("Success")
    })
  }

  endInnings(selectedMatch: Tournament) {
    selectedMatch = { ...selectedMatch, completed:true };
    this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
      this.router.navigateByUrl("../adminDashboard")
    });
  }
  canDeactivate():boolean { return false}
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import * as _ from 'lodash';
import { filter, forkJoin, switchMap } from 'rxjs';
import { BattingSession, BowlingSession, MatchDetails, Player, Tournament } from 'src/app/@core/models/Player.model';
import { ScoreService } from 'src/app/@core/services/score/score.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: "app-scorebook",
  templateUrl: "./scorebook.component.html",
  styleUrls: ["./scorebook.component.scss"],
})
export class ScorebookComponent implements OnInit {
  stateOptions = [] as any;
  battingTeam = {} as any;
  battingDetailsTeam1: BattingSession[] = []; //Team 1 batting
  battingDetailsTeam2: BattingSession[] = []; //Team 2 batting
  bowlingDetailsTeam1: BowlingSession[] = []; //Team 1 batting
  bowlingDetailsTeam2: BowlingSession[] = []; //Team 2 batting
  matchDetails: MatchDetails | undefined;
  tournament: Tournament = {} as any;
  allPlayers: Player[] = [] as any;
  matchNo = this.route.snapshot.paramMap.get("matchNo") || "1";
  dummyPlayer: Player[] = [
    {
      name: "-Select-",
      active: null,
      team: null,
      id: null,
    },
  ] as any;
  playerPoolForCricInfo: Player[] = [] as any;
  constructor(private scoreService: ScoreService, private router: Router,private route: ActivatedRoute,) {}
  yesOrNo = [
    { name: "Yes", value: true },
    { name: "No", value: false },
    { name: "-Select-", value: null },
  ];
  ngOnInit(): void {
    for (let i = 0; i < 12; i++) {
      let dummyBattObj: BattingSession = {
        batterName: null,
        runs: null,
        balls: null,
        fours: null,
        sixes: null,
        out: null,
        catchOrStumpedBy: null,
      } as any;
      let dummyBowlerObj: BowlingSession = {
        bowlerName: null,
        overs: null,
        dots: null,
        runs: null,
        wickets: null,
      } as any;
      this.battingDetailsTeam1.push({ ...dummyBattObj });
      this.bowlingDetailsTeam1.push({ ...dummyBowlerObj });
      this.battingDetailsTeam2.push({ ...dummyBattObj });
      this.bowlingDetailsTeam2.push({ ...dummyBowlerObj });
    }
    this.scoreService
      .getMatchDetailsByMatchNo(this.matchNo)
      .pipe(
        filter(p=>p!=null),
        switchMap((o: Tournament) => {
          this.tournament = o;
          this.stateOptions = [
            { label: o?.team1, value: "team1" },
            { label: o?.team2, value: "team2" },
          ];
          return this.scoreService.getMatchDetails(o?.matchNo);
        })
      )
      .pipe(filter(o=>o!=null))
      .subscribe((match) => {
        this.playerPoolForCricInfo = [...match.team1.players.filter((o) => o.active == "active"),...match.team2.players.filter((o) => o.active == "active")];
        match.team1.players = [
          ...this.dummyPlayer,
          ...match.team1.players.filter((o) => o.active == "active"),
        ];
        match.team2.players = [
          ...this.dummyPlayer,
          ...match.team2.players.filter((o) => o.active == "active"),
        ];
        this.matchDetails = match;
      });
  }
  populateScoresFromCricInfo(){
    this.battingDetailsTeam1 =[];
      this.bowlingDetailsTeam1=[];
      this.battingDetailsTeam2=[];
      this.bowlingDetailsTeam2=[];
    forkJoin([this.scoreService.getScoreCardByMatchNo(this.matchNo), this.scoreService.getOverDetailsByMatchNo(this.matchNo)]).subscribe(datas=>{
      let grouped= datas[1].inningOvers.map((o: { stats: any; })=>{
        return _.groupBy(o.stats,(p: { bowlers: { id: any; }[]; })=>{
          return p.bowlers[0].id
        })
      })
      var bowlerDetails=[];
      for (var key in grouped) {
        let d = grouped[key] as any[];
        for(var p in d){
          let ineligibleDot =0;
          let bowler ='';
          for(var over of d[p]){
            bowler=over.bowlers[0].longName;
            for(var ball of over.balls){
              if(ball.batsmanRuns == 0 && (ball.byes>0 || ball.legbyes>0)){
                ineligibleDot++;
              }
            }
          }
          bowlerDetails.push({bowlerId:Number(p),bowlerName:bowler, ineligibleDots: ineligibleDot })
        }
      }


      let inningsData = datas[0];
      this.stateOptions = [];
      this.battingTeam = "team1";
      for(let inning of inningsData.innings){
        if(inning.inningNumber==1){
          this.stateOptions.push({ label: inning.team.longName, value: "team1" });
          for(let batmen of inning.inningBatsmen){
            if(batmen.runs!=null){
              this.battingDetailsTeam1.push(this.cricInfoBatterToFantasticBatter(batmen) as any);
            }
          }
          for(let bowler of inning.inningBowlers){
            if(bowler.conceded!=null){
              let ineligbleDots = bowlerDetails.find(o=>o.bowlerId == bowler.player.id)?.ineligibleDots
              bowler.dots = bowler.dots-(ineligbleDots||0);
              this.bowlingDetailsTeam1.push(this.cricInfoBowlerToFantasticBowler(bowler) as any);
            }
          }
        }else{
          this.stateOptions.push({ label: inning.team.longName, value: "team2" });
          for(let batmen of inning.inningBatsmen){
            if(batmen.runs!=null){
              this.battingDetailsTeam2.push(this.cricInfoBatterToFantasticBatter(batmen) as any);
            }
          }
          for(let bowler of inning.inningBowlers){
            if(bowler.conceded!=null){
              let ineligbleDots = bowlerDetails.find(o=>o.bowlerId == bowler.player.id)?.ineligibleDots
              bowler.dots = bowler.dots-(ineligbleDots||0);
              this.bowlingDetailsTeam2.push(this.cricInfoBowlerToFantasticBowler(bowler) as any);
            }
          }
        }
      }
    })

  }
  updateScore(battingTeam: string) {
    let data = null;
    if (battingTeam == "team1") {
      data = {
        match: this.tournament?.matchNo || "",
        bowlingSession: this.bowlingDetailsTeam1.filter(
          (o) => o.bowlerName != null
        ),
        battingSession: this.battingDetailsTeam1.filter(
          (o) => o.batterName != null
        ),
      };
    } else {
      data = {
        match: this.tournament?.matchNo || "",
        bowlingSession: this.bowlingDetailsTeam2.filter(
          (o) => o.bowlerName != null
        ),
        battingSession: this.battingDetailsTeam2.filter(
          (o) => o.batterName != null
        ),
      };
    }
    this.scoreService.updateInningsSession(data).subscribe((o) => {
      alert("Success");
    });
  }

  endInnings(selectedMatch: Tournament) {
    selectedMatch = { ...selectedMatch, completed: true, started: false };
    this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
      this.router.navigate(['./home/adminDashboard'])
    });
  }
  canDeactivate(): boolean {
    return !(
      this.battingDetailsTeam1.find((o) => Object.values(o).find(b=>b!=null) != null) ||
      this.battingDetailsTeam2.find((o) => Object.values(o).find(b=>b!=null) != null) ||
      this.bowlingDetailsTeam1.find((o) => Object.values(o).find(b=>b!=null) != null) ||
      this.bowlingDetailsTeam2.find((o) => Object.values(o).find(b=>b!=null) != null)
    );
  }

  cricInfoBatterToFantasticBatter(batmen:any){
    return  {
      batterName: this.playerNameToObject(batmen.player.longName),
      runs: batmen.runs,
      balls: batmen.balls,
      fours: batmen.fours,
      sixes: batmen.sixes,
      out: batmen.isOut,
      catchOrStumpedBy: this.playerNameToObject((batmen.dismissalFielders!= null && batmen.dismissalFielders.length==1 && batmen.dismissalFielders[0].player != null) ? batmen.dismissalFielders[0].player.longName: null),
    }
  }

  cricInfoBowlerToFantasticBowler(bowler:any){
    return {
      bowlerName: this.playerNameToObject(bowler.player.longName),
      overs: bowler.overs,
      dots: bowler.dots,
      runs: bowler.conceded,
      wickets: bowler.wickets,
    }
  }

  playerNameToIdConverter(cricName:string,): number | null {
    let id = this.playerPoolForCricInfo.find((o) => o.name ==cricName)?.id;
    return id || null;
  }
  playerNameToObject(cricName:string): Player | undefined {
    if(cricName==null) return;
     console.log(cricName);
     return this.playerPoolForCricInfo.find((o) => {
       let split = cricName.replace("-"," ").split(' ');
       let split2 = o.name.replace("-"," ").split(' ');
       return (o.name.includes(split[split.length-1]) && o.name.includes(split[split.length-2]) )|| (cricName.includes(split2[split2.length-1]) && cricName.includes(split2[split2.length-2]) ); ;
     });
   }
}

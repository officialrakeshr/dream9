import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UntilDestroy } from "@ngneat/until-destroy";
import * as moment from "moment";
import { map, Observable, tap } from "rxjs";
import { MatchDetails, Team, Tournament } from "src/app/@core/models/Player.model";
import { Points } from "src/app/@core/models/points";
import { ScoreService } from "src/app/@core/services/score/score.service";
import { UserService } from "src/app/@core/services/user/user.service";

@UntilDestroy({ checkProperties: true })
@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  enrolPlayerModal: boolean = false;
  rankModall:boolean = false;
  createMatchModal:boolean = false;
  newUniqueId = "";
  selectedMatchNo = "";
  newUsername ="";
  newPhone="";
  selectedMatch!: Tournament;
  playerOptions = [
    { name: "Active", value: "active" },
    { name: "Inactive", value: "inactive" },
  ];
  matchDetails$: Observable<MatchDetails> | undefined;
  currentMatchRankings:any;
  lastUpdatedTime: string | undefined;
  newMatchObj:Tournament={
    matchNo: '',
    team1: '',
    team2: '',
    completed: false,
    enable11: false,
    started: false
  } as any;
  listTeams: Team[] = [] as any;
  rank: Points[] = null as any;
  constructor(
    private scoreService: ScoreService,
    private userService: UserService,
    private router: Router
  ) {}
  tournaments$ = this.scoreService.getTournaments();
  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
     this.scoreService.listTeams().subscribe(o=>{
      this.listTeams=o["teams"];
     });
     this.refreshScore();
  }

  getMatchDetails(optionValue: any) {
    this.matchDetails$ = this.scoreService.getMatchDetails(optionValue.matchNo);
  }
  refreshScore(){
    let i=0;
    this.scoreService.findAllRank().subscribe((o:Points[])=>{
      o.sort((a,b)=>{
        return b.total - a.total;
      }).map((p:Points)=>{
        p.rank_no = ++i;
        return p;
      })
      this.rank = o;
      this.lastUpdatedTime = moment().format("DD-MM-YYYY HH:mm:ss A")
    })
  }
  updatePlayers(matchDetails: MatchDetails) {
    this.scoreService.updateMatchDetails(matchDetails).subscribe();
  }

  enableDream9(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to enable Fantastic 12 for this match ${selectedMatch.matchNo}?`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: true };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        window.location.reload();
      });
    }
    
  }
  closeDream9(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to close Fantastic 12 for this match ${selectedMatch.matchNo}?`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: false };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        window.location.reload();
      });
    }
  }

  startMatch(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to start this match ${selectedMatch.matchNo}?. This will close Fantastic12 session of this match.`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: false, started: true };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        window.location.reload();
      });
    }
  }

  createANewMatch(team1:string,team2:string,match:string) {
    let conf= confirm(`Do yo want to a new match ?`)
    if(conf){
      if(team1==team2) return alert("Same teams. Please select correct teams")
      if(!match) return alert("Match No is mandatory")
      var tournament:Tournament={
        id: 0,
        matchNo: String(match),
        team1: team1,
        team2: team2,
        completed: false,
        enable11: false,
        started: false
      } as any;
      this.scoreService.createNewMatch(tournament).subscribe((o) => {
        if(o.id){
          alert(`Match No: ${o.matchNo} created with Teams ${o.team1} & ${o.team2}`);
          this.tournaments$ = this.scoreService.getTournaments();
        }
      },()=>{
        alert("Please check your match number")
      });
    }
  }

  makeid() {
    this.newUniqueId = "";
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    this.newUniqueId = text;
  }
  generateUser(
    selectedMatchNo: any,
    username: any,
    phone: any,
    newUniqueId: any
  ): any {
    /* if (
      selectedMatchNo == undefined ||
      selectedMatchNo == null ||
      selectedMatchNo == ""
    ) {
      alert("Select a valid match no.");
      return false;
    } */

    if (username == undefined || username == null || username == "") {
      alert("Select a valid name.");
      return false;
    }
    if (phone == undefined || phone == null || phone == "") {
      alert("Select a valid phone no.");
      return false;
    }
    if (newUniqueId == undefined || newUniqueId == null || newUniqueId == "") {
      alert("Select a valid unique id.");
      return false;
    }
    let data = {
      name: username,
      username: newUniqueId,
      password: newUniqueId,
      phone: phone,
      matchNumber: selectedMatchNo,
      role: ["user"],
    };
    this.userService.isUniqueIdAvailable(newUniqueId).subscribe((o) => {
      if (o) {
        this.userService.registerUser(data).subscribe((msg) => {
          if (msg) {
            this.newUniqueId = '';
            this.newUsername='';
            this.newPhone='';
            //this.enrolPlayerModal = false;
            alert("User generated with UniqueID: " + newUniqueId);
          }
        });
      } else {
        alert("Please generate a new Unique ID");
      }
    });
  }
  canDeactivate(): boolean {
    return true;
  }
}

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UntilDestroy } from "@ngneat/until-destroy";
import * as moment from "moment";
import { Observable, tap } from "rxjs";
import { MatchDetails, Tournament } from "src/app/@core/models/Player.model";
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
  newUniqueId = "";
  selectedMatchNo = "";
  selectedMatch!: Tournament;
  playerOptions = [
    { name: "Active", value: "active" },
    { name: "Inactive", value: "inactive" },
  ];
  matchDetails$: Observable<MatchDetails> | undefined;
  currentMatchRankings:any;
  lastUpdatedTime: string | undefined;
  constructor(
    private scoreService: ScoreService,
    private userService: UserService,
    private router: Router
  ) {}
  tournaments$ = this.scoreService.getTournaments();
  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  getMatchDetails(optionValue: any) {
    this.matchDetails$ = this.scoreService.getMatchDetails(optionValue.matchNo);
    this.refreshScore();
  }
  refreshScore(){
    this.scoreService.findAllRankByMatchAdmin(this.selectedMatch.matchNo).subscribe((o:Points)=>{
      this.lastUpdatedTime = moment().format("DD-MM-YYYY HH:mm:ss A");
      this.currentMatchRankings = o;
    });
  }
  updatePlayers(matchDetails: MatchDetails) {
    this.scoreService.updateMatchDetails(matchDetails).subscribe();
  }

  enableDream9(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to enable Dream 9 for this match ${selectedMatch.matchNo}?`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: true };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        let currentUrl = this.router.url;
        this.router.navigate([currentUrl])
      });
    }
    
  }
  closeDream9(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to close Dream 9 for this match ${selectedMatch.matchNo}?`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: false };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        let currentUrl = this.router.url;
        this.router.navigate([currentUrl])
      });
    }
  }

  startMatch(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to start this match ${selectedMatch.matchNo}?. This will close Dream9 session of this match.`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: false, started: true };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        let currentUrl = this.router.url;
        this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      });
    }
  }

  createANewMatch(team1:string,team2:string,match:string) {
    let conf= confirm(`Do yo want to a new match ?`)
    if(conf){
      var tournament:Tournament={
        id: 0,
        matchNo: match,
        team1: team1,
        team2: team2,
        completed: false,
        enable11: false,
        started: false
      };
      this.scoreService.createNewMatch(tournament).subscribe((o) => {
        if(o.id){
          alert(`${o.matchNo} created with Teams ${o.team1} & ${o.team2}`);
        }
      });
    }
  }

  makeid() {
    this.newUniqueId = "";
    var text = "DXL";
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
    if (
      selectedMatchNo == undefined ||
      selectedMatchNo == null ||
      selectedMatchNo == ""
    ) {
      alert("Select a valid match no.");
      return false;
    }

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
            this.enrolPlayerModal = false;
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

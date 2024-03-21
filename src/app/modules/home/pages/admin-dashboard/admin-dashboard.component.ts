import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UntilDestroy } from "@ngneat/until-destroy";
import * as _ from "lodash";
import * as moment from "moment";
import { MessageService } from "primeng/api";
import { map, Observable, tap } from "rxjs";
import { MatchDetails, Player, Team, Tournament } from "src/app/@core/models/Player.model";
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
  broadcastMsg:boolean = false;
  pushMessage:string = "";
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
  playerNew: Player = {
    name: "",
    team: "",
  } as any;
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
    private router: Router,
    private messageService: MessageService
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
      let a = o.sort((a,b)=>{
        return b.total - a.total;
      })
      let groupByPoints = _.groupBy(a, "total");
      let temp: Points[] =[];
      for (const key of _.keys(groupByPoints).sort((a,b)=>Number(b)-Number(a))) {
        if (groupByPoints.hasOwnProperty(key)) {
          let rank = ++i;
          groupByPoints[key].forEach(o=>{
            o.rank_no = rank;
            temp.push(o);
          })
        }
      }
      this.rank = temp;
      this.lastUpdatedTime = moment().format("DD-MM-YYYY HH:mm:ss A")
    })
  }
  updatePlayers(matchDetails: MatchDetails) {
    this.scoreService.updateMatchDetails(matchDetails).subscribe();
  }

  enableDream9(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to enable "Fantastic 12" for this match ${selectedMatch.matchNo}?`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: true };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        this.sendMessage(`"Fantastic 12" enabled for the match no: ${selectedMatch.matchNo}`);
        this.reloadUser();
        window.location.reload();
      });
    }
    
  }
  closeDream9(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to close "Fantastic 12" for this match ${selectedMatch.matchNo}?`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: false };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        this.sendMessage(`"Fantastic 12" closed for the match no: ${selectedMatch.matchNo}`);
        this.reloadUser();
        window.location.reload();
      });
    }
  }
//
backToStartedMatch(selectedMatch: Tournament) {
  let conf= confirm(`Do yo want to revert complete status of this match ${selectedMatch.matchNo}?.This will make the status of the match - STARTED`)
  if(conf){
    selectedMatch = { ...selectedMatch,completed:false, enable11: false, started: true };
    this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
      window.location.reload();
    });
  }
}
  startMatch(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to start this match ${selectedMatch.matchNo}?. This will close "Fantastic12" session of this match.`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: false, started: true };
      this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
        this.sendMessage(`Match ${selectedMatch.matchNo} started!`);
        this.reloadUser();
        window.location.reload();
      });
    }
  }

  abandonMatch(selectedMatch: Tournament) {
    let conf= confirm(`Do yo want to abandon this match ${selectedMatch.matchNo}?. This will close Fantastic12 session of this match.`)
    if(conf){
      selectedMatch = { ...selectedMatch, enable11: false, started: false , completed: true };
      this.scoreService.abandonMatch(selectedMatch).subscribe((o) => {
        this.sendMessage(`Match ${selectedMatch.matchNo} abandoned!`);
        this.reloadUser();
        window.location.reload();
      });
    }
  }
  reloadUser(propt?:boolean){
    if(propt){
      let conf= confirm(`Do yo want to reload user screens ?`)
      if(conf==true){
        this.scoreService.reloadPlayerScreen().subscribe(o=>alert("Done"));
      }
    }else{
      this.scoreService.reloadPlayerScreen().subscribe(o=>alert("Done"));
    }
  }

  lotoutUser(propt?:boolean){
    if(propt){
      let conf= confirm(`Do yo want to log-off user ?`)
      if(conf==true){
        this.scoreService.logoutAll().subscribe(o=>alert("Done"));
      }
    }else{
      this.scoreService.logoutAll().subscribe(o=>alert("Done"));
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
        this.showMessage("error","","Please generate a new Unique ID");
      }
    });
  }

  sendMessage(message: string) {
    this.scoreService.broadcastMessage(message).subscribe((o) => {
      if(o>1){
        this.pushMessage = ""
      }
    })
  }

  private showMessage(
    severity: string = "success",
    summary: string,
    detail: string
  ) {
    this.messageService.clear();
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      sticky: true,
    });
  }
  canDeactivate(): boolean {
    return true;
  }

  createNewPlayer(team:string="", playername: string="", alias:string=""){
    if(team ==="" || playername ==="") return ;
    if(alias ===""){
      alias = playername;
    }
    let confirm = window.confirm(`Are you sure you want to create a new IPL player?: ${playername} - ${team}`);
    if(confirm){
      this.scoreService.createNewPlayer(team.trim(),playername.trim(),alias.trim()).subscribe(o=>{
        alert("Done")
      })
    }
    
  }

  updateIPLAllDetailsFromCricInfo(){
    this.showMessage("info","","Please wait !!!.. It will take some time");
    this.scoreService.updateIPLAllDetailsFromCricInfo().subscribe(o=>{
      this.showMessage("info","",o?"Done..Reloading...":"Something went wrong..");
      setTimeout(()=>{
        window.location.reload();
      },1000)
    })
  }
}

import { Component, OnInit, ViewChild } from "@angular/core";
import { Player, Substitute, Tournament } from "src/app/@core/models/Player.model";
import { FilterService, MessageService } from "primeng/api";
import * as _ from "lodash";

import { ScoreService } from "src/app/@core/services/score/score.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { ActivatedRoute, Router } from "@angular/router";
import { interval, map, Observable, tap } from "rxjs";
import * as moment from "moment-timezone";
import { AppState } from "src/app/@core/redux/app.state";
import { Store } from "@ngrx/store";
import { selectMsg } from "src/app/@core/redux/login/login.selector";
import { addPushMessage } from "src/app/@core/redux/login/login.action";
export interface COLUMN {
  field: string;
  header: string;
  filter: any[];
}
export interface FILTER {
  name: any;
}

@UntilDestroy({ checkProperties: true })
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @ViewChild("dt1") dt1: any;
  @ViewChild("dt2") dt2: any;
  players: Player[] = [];
  selectedPlayers: Player[] = [];
  cols: COLUMN[] = [];
  playerList: Player[] = [];
  tournament: Tournament = {} as any;

  public AllRoundersCountLimit = 3;
  public captainCountLimit = 1;
  public viseCaptainCountLimit = 1;
  public teamSizeLimit = 12;
  public wicketKeeperCountLimit = 1;
  public subCountLimit = null;
  public battingHeroLimit = 1;
  public bowlingHeroLimit = 1;

  public AllRoundersCount = 0;
  public captainCount = 0;
  public viseCaptainCount = 0;
  public teamSize = 0;
  public wicketKeeperCount = 0;
  public subCountUsed = 0;
  public battingHeroCount = 0;
  public bowlingHeroCount = 0;

  private _history: Player[][] = [];

  roleList = [
    // { value: "", name: "-Select-", inactive: false },
    { value: "captain", name: "Captain", inactive: false },
    { value: "vcaptain", name: "Vice-Captain", inactive: false },
    { value: "battinghero", name: "Batting Hero", inactive: false },
    { value: "bowlinghero", name: "Bowling Hero", inactive: false },
    { value: "player5", name: "Player 5", inactive: false },
    { value: "player6", name: "Player 6", inactive: false },
    { value: "player7", name: "Player 7", inactive: false },
    { value: "player8", name: "Player 8", inactive: false },
    { value: "player9", name: "Player 9", inactive: false },
    { value: "player10", name: "Player 10", inactive: false },
    { value: "player11", name: "Impact Sub 1", inactive: false },
    { value: "player12", name: "Impact Sub 2", inactive: false },
    // { value: 'allrounder', name: 'All-Rounder', inactive: false },
  ];
   sortOrder = [
    "captain", 
    "vcaptain", 
    "battinghero", 
    "bowlinghero", 
    "player5", 
    "player6", 
    "player7", 
    "player8", 
    "player9", 
    "player10", 
    "player11", 
    "player12"
];
  lockTime: Date = null as any
  roleCount: number = 0;
  substitutePopup: boolean = false;
  substituteIndex: number = -1;
  matchNo: string = "";
  substititions$: Observable<Substitute> = null as any;
  countDownTime$: Observable<any> = null as any;
  enableReset: any;

  saveWarning: boolean = false;
  subLimitReached: boolean = false;
  openBonusRolePopup: boolean = false;
  bonusRoles: any[] = [];
  totalNegPoints: number = 0;
  timeZoneAbbreviation = 'IST';
  constructor(
    private filterService: FilterService,
    private messageService: MessageService,
    private scoreService: ScoreService,
    private router: Router,
    private route: ActivatedRoute,
    public store: Store<AppState>
  ) {

  }

  checkUndo() {
    return this._history.length < 1;
  }
  updateSquadHistory(cur: Player[]) {
    /* this._history.push(_.cloneDeep(cur));
    console.log(this._history) */
  }
  retrieveHistory() {
    let len = this._history.length;
    if (len == 1 || len == 0) return [];
    //this._history.pop();
    let v = this._history.pop() || [];
    //this._history = [];
    return _.cloneDeep(v);
  }
  undo() {
    if (confirm("Do you want to undo this last squad change")) {
      this.selectedPlayers = this.retrieveHistory();
      this.reset();
      this.calculateCounts();
      if (this.subCountLimit) this.subCountUsed++;
      //this.updateSquadHistory(this.selectedPlayers);
    }
  }

  codeToName(value: string): string | undefined {
    return this.roleList.find((o) => o.value == value)?.name;
  }

  getSubstitution(matchNo:string){
    return this.scoreService.getSubstitutionStatus(matchNo).pipe(tap(o=>{
      this.enableReset= o.total < 10;
      this.subLimitReached = o.total <= o.used;
      this.totalNegPoints = (o.total - o.used-1)*-25;
    }));
  }

  resetToPreviousDay(matchNo:string){
    // confirm
    let confi = confirm("Are you sure you want to reset to the previous day?");
    if(confi){
      return this.scoreService.resetToPreviousDay(matchNo).subscribe(o=>{
        window.location.reload();
      })
    }
    return null;
    
  }
  ngOnInit(): void {
    let matchNo = this.route.snapshot.paramMap.get("matchNo") || "1";
    this.matchNo = matchNo;
    this.substititions$ = this.getSubstitution(matchNo);
    this.scoreService.getMatchDetailsByMatchNo(matchNo).pipe(tap(p=>{
      if(!p.enable11) this.router.navigate(['./home/fixture']);
    })).subscribe((o) => {
      this.tournament = o;
      // Get the timezone from the system clock
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Define the IST date string
      const indianTime = `${o.matchdate}<>${o.matchtime}`;
      // Parse the IST date string using Moment.js
      const istDate = moment.tz(indianTime, "MMMM D, YYYY<>h:mm A", "Asia/Kolkata");
      // Convert the IST date to the system timezone
      const systemTimezoneDate = istDate.clone().tz(systemTimeZone);
      let temp = moment.tz(moment.tz.guess()).zoneAbbr() as any;

      this.timeZoneAbbreviation = isNaN(temp) ? temp : 'GMT'+temp;
      this.lockTime = systemTimezoneDate.toDate();
      
      /* if(moment(moment(`${o.matchdate}<>${o.matchtime}`,"MMMM D, YYYY<>h:mm A", true)).diff(moment(),'seconds')<0){
        alert("Match Started...")
        this.router.navigate(['./home/fixture'])
      } */
      this.countDownTime$ = interval(1000).pipe(map(d=>{
        let inseconds = moment(systemTimezoneDate).diff(moment(),'seconds');
      if(inseconds<60){
        this.saveWarning = true;
      }else  this.saveWarning = false;
        /* if(inseconds<0){
          alert("Match Started...")
          this.router.navigate(['./home/fixture'])
        } */
        let duration = moment.duration(moment(systemTimezoneDate).diff(moment())) as any;
        return [duration._data.days, duration._data.hours, duration._data.minutes, duration._data.seconds];
      }))
      this.getPlayerList();
      (this.store.select(selectMsg) as Observable<any>).subscribe(o=>{
        if(o["msg"] == '' || o["read"]==true) return;
        this.showMessage(
          "success",
          "Message from Admin",
          o["msg"]
        );
        this.store.dispatch(addPushMessage({payload:{'msg':o["msg"],read:true}}));
      })
    });
    this.scoreService.getDream9playerConfig(matchNo).subscribe((o) => {
      if (o != null) {
        this.selectedPlayers = [];
        this.teamSize = this.selectedPlayers.length;
        this.selectedPlayers = o
          .map((p) => {
            p.roleList = this.roleList;
            return p;
          })
          .sort((a, b) => {
            return this.sortOrder.indexOf(a.assignedRole||"") - this.sortOrder.indexOf(b.assignedRole||"");
          });

        this.dt1.clear();
        this.reset();
        this.calculateCounts();
        this.roleCount =
          this.selectedPlayers.filter((o) => o.assignedRole != null).length ||
          0;
      }
    });
  }

  getPlayerList() {
    this.scoreService.getPlayerList().subscribe((o: Player[]) => {
      this.playerList = o.filter((p) => p.active == "active");
      this.cols = [
        { field: "name", header: "Player", filter: [] },
       // { field: "imageUrl", header: "", filter: [] },
        { field: "team", header: "Team", filter: [] },
      ];
      for (let col of this.cols) {
        let set = new Set<string>();
        for (let p of this.playerList) {
          set.add((p as any)[col.field]);
        }
        col.filter = Array.from(set).map((value) => {
          let obj = {} as any;
          obj[col.field] = value;
          return value;
        });
      }
      this.reset();
    });
  }

  selectPlayer(data: Player, index: number) {
    if (this.selectedPlayers.includes(data)) return;
    let confirm = window.confirm(`Are you sure you want to add this player ( ${data.name} - ${data.team} ) to your league ?`);
    this.teamSize = this.selectedPlayers.length;

    if (confirm && this.validations(data)) {
      data.roleList = this.roleList;
      let eligibleRole= data.roleList.find(o=>!o.inactive);
      data.assignedRole = eligibleRole?.value;
      if(eligibleRole) eligibleRole.inactive = true;
      this.updateSquadHistory(this.selectedPlayers);
      this.selectedPlayers.push(data);
      this.selectedPlayers.sort((a, b) => {
        return this.sortOrder.indexOf(a.assignedRole||"") - this.sortOrder.indexOf(b.assignedRole||"");
      });
      this.dt1.clear();
      this.reset();
      this.calculateCounts();
      if (this.subCountLimit) this.subCountUsed++;
      this.showMessage(
        "success",
        "XI Update",
        `Player ${data.name} added to your XI`
      );
    }
  }

  remove(index: number) {
    if (
      confirm(
        "Do you want to remove this player :" +
          this.selectedPlayers[index]["name"]
      )
    ) {
      this.selectedPlayers.splice(index, 1);
      this.dt1.clear();
      this.reset();
      this.calculateCounts();
      this.updateSquadHistory(this.selectedPlayers);
    }
  }

  reset() {
    this.players = this.playerList.filter((o) => {
      return !this.selectedPlayers.find(
        (b) => b["name"] == o["name"] && b.team == o.team
      );
    });
  }
  calculateCounts() {
    this.roleCount = 0;
    this.AllRoundersCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, "allrounder")
    ).length;

    this.captainCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, "captain")
    ).length;

    this.viseCaptainCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, "vcaptain")
    ).length;
    this.teamSize = this.selectedPlayers.length;
    this.wicketKeeperCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, "wk")
    ).length;
    this.battingHeroCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, "battinghero")
    ).length;
    this.bowlingHeroCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, "bowlinghero")
    ).length;
  }
  processSear(role: string) {
    return (
      this.selectedPlayers.filter((o) =>
        this.filterService.filters.equals(o.assignedRole, role)
      ).length > 0
    );
  }
  findFirstRolePlayer(role: string) {
    return this.selectedPlayers.find((o) =>
      this.filterService.filters.equals(o.assignedRole, role)
    );
  }
  processDropDown(roleList: any[]): void {
    this.calculateCounts();
    this.roleCount = 0;
    /*     if (this.AllRoundersCount >= this.AllRoundersCountLimit) {
      roleList.find((o) => o.value == 'allrounder').inactive = true;
    } */
    if (this.processSear("captain")) {
      roleList.find((o) => o.value == "captain").inactive = true;
      this.roleCount++;
    } else roleList.find((o) => o.value == "captain").inactive = false;
    if (this.processSear("vcaptain")) {
      this.roleCount++;
      roleList.find((o) => o.value == "vcaptain").inactive = true;
    } else roleList.find((o) => o.value == "vcaptain").inactive = false;
    if (this.processSear("battinghero")) {
      this.roleCount++;
      roleList.find((o) => o.value == "battinghero").inactive = true;
    } else roleList.find((o) => o.value == "battinghero").inactive = false;
    if (this.processSear("bowlinghero")) {
      this.roleCount++;
      roleList.find((o) => o.value == "bowlinghero").inactive = true;
    } else roleList.find((o) => o.value == "bowlinghero").inactive = false;
    if (this.processSear("player5")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player5").inactive = true;
    } else roleList.find((o) => o.value == "player5").inactive = false;
    if (this.processSear("player6")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player6").inactive = true;
    } else roleList.find((o) => o.value == "player6").inactive = false;
    if (this.processSear("player7")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player7").inactive = true;
    } else roleList.find((o) => o.value == "player7").inactive = false;
    if (this.processSear("player8")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player8").inactive = true;
    } else roleList.find((o) => o.value == "player8").inactive = false;
    if (this.processSear("player9")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player9").inactive = true;
    } else roleList.find((o) => o.value == "player9").inactive = false;
    if (this.processSear("player10")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player10").inactive = true;
    } else roleList.find((o) => o.value == "player10").inactive = false;
    if (this.processSear("player11")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player11").inactive = true;
    } else roleList.find((o) => o.value == "player11").inactive = false;
    if (this.processSear("player12")) {
      this.roleCount++;
      roleList.find((o) => o.value == "player12").inactive = true;
    } else roleList.find((o) => o.value == "player12").inactive = false;
  }
  validations(data: Player): boolean {
    this.calculateCounts();
    if (this.teamSize >= this.teamSizeLimit) {
      this.showMessage(
        "error",
        "Block",
        `A team cannot have more than ${this.teamSizeLimit} players`
      );
      return false;
    } else return true;
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
  submitXI(selectedPlayers: Player[]) {
    let rolesMsg = this.bonusRoles.map(o => {
      return "" + o.role + " : " + (o.playerList.find((p: Player) => p.id == o.selectedPlayer)?.name || "") + "\n" 
    })
    console.log(rolesMsg.join(''))
    if (confirm("Proceed with this roles ? "+ "\n" +"*************************"+ "\n" + rolesMsg.join(''))) {
      const roles = this.roleList
        .filter((o) => o.value != "")
        .map((o) => o.value);
      let data = {
        matchNo: this.tournament.matchNo,
        username: "",
        rank_no: 0,
        total: 0,
        captain: 0,
        vcaptain: 0,
        battinghero: 0,
        bowlinghero: 0,
        player5: 0,
        player6: 0,
        player7: 0,
        player8: 0,
        player9: 0,
        player10: 0,
        player11: 0,
        player12: 0,
        captainPoint: 0,
        vcaptainPoint: 0,
        battingHeroPoint: 0,
        bowlingHeroPoint: 0,
        player5Point: 0,
        player6Point: 0,
        player7Point: 0,
        player8Point: 0,
        player9Point: 0,
        player10Point: 0,
        player11Point: 0,
        player12Point: 0,
      } as any;
      roles.forEach((role) => {
        data[role] = this.findFirstRolePlayer(role)?.id;
      });
      this.scoreService.updateDream9Details(data).subscribe((o) => {
        if (o) {
          this.showMessage("success", "", "Done.");
          this.substititions$ = this.getSubstitution(this.matchNo);
        }
      });
    }

  }
  substitute(rowIndex: number) {
    if(this.selectedPlayers.some(o=> o.assignedRole == "")){
      this.showMessage("error","","You can't substitute a player. Please assign a role first.");
      return;
    }
    this.substitutePopup = true;
    this.substituteIndex = rowIndex;
  }
  substitutePlayer(rowData: Player, rowIndex: number) {
    this.substitutePopup = false;
    let copyRow = _.cloneDeep(rowData);
    let item = this.selectedPlayers[this.substituteIndex];
    let c = confirm(
      "Do you want to substitute '" +
        item.name +
        "' with '" +
        copyRow.name +
        "' ? "+  (this.subLimitReached ?`. This substitution will cost you 25 points. Total ${this.totalNegPoints} points ( ${this.totalNegPoints/25} extra substitution x 25) will be reduced during the match score caculation.` :'')
    );
    if (c) {
      this.selectedPlayers.splice(this.substituteIndex, 1);
      copyRow.assignedRole = item.assignedRole;
      copyRow.roleList = item.roleList;

      this.selectedPlayers.push(copyRow);
      this.selectedPlayers.sort((a, b) => {
            return this.sortOrder.indexOf(a.assignedRole||"") - this.sortOrder.indexOf(b.assignedRole||"");
          });
      this.dt1.clear();
      this.reset();
      this.calculateCounts();
      this.updateSquadHistory(this.selectedPlayers);
      this.processDropDown(copyRow.roleList as any[]);
      const roles = this.roleList
        .filter((o) => o.value != "")
        .map((o) => o.value);

      let data = {
        matchNo: this.tournament.matchNo,
        username: "",
        rank_no: 0,
        total: 0,
        captain: 0,
        vcaptain: 0,
        battinghero: 0,
        bowlinghero: 0,
        player5: 0,
        player6: 0,
        player7: 0,
        player8: 0,
        player9: 0,
        player10: 0,
        player11: 0,
        player12: 0,
        captainPoint: 0,
        vcaptainPoint: 0,
        battingHeroPoint: 0,
        bowlingHeroPoint: 0,
        player5Point: 0,
        player6Point: 0,
        player7Point: 0,
        player8Point: 0,
        player9Point: 0,
        player10Point: 0,
        player11Point: 0,
        player12Point: 0,
      } as any;
      roles.forEach((role) => {
        data[role] = this.findFirstRolePlayer(role)?.id;
      });
      this.scoreService.updateSubstitutionsAndConfig(data).subscribe((o) => {
        if (o) {
          this.showMessage("success","","Done.");
          this.substititions$ = this.getSubstitution(this.matchNo);
        } 
      });
    }
  }
  assignBonusRoles(){
    this.openBonusRolePopup = true;
    this.bonusRoles = [];
    this.bonusRoles.push({role: "Captain", value: "captain" , playerList: this.selectedPlayers , selectedPlayer : this.selectedPlayers.find(o=>o.assignedRole == "captain")?.id});
    this.bonusRoles.push({role: "Vice captain", value: "vcaptain", playerList: this.selectedPlayers, selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "vcaptain")?.id});
    this.bonusRoles.push({role: "Batting hero", value: "battinghero", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "battinghero")?.id});
    this.bonusRoles.push({role: "Bowling hero", value: "bowlinghero", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "bowlinghero")?.id});
    this.bonusRoles.push({role: "Impact Sub 1", value: "player11", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "player11")?.id});
    this.bonusRoles.push({role: "Impact Sub 2", value: "player12", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "player12")?.id});
  }
  changeRole(role: any){
    let selectedPlayerIndex = this.selectedPlayers.findIndex(o=>o.id == role.selectedPlayer)
    let curRolePlayerIndex = this.selectedPlayers.findIndex(o=>o.assignedRole == role.value);
    if(selectedPlayerIndex!=-1 && curRolePlayerIndex!= -1){
      let curPlayerRole = this.selectedPlayers[curRolePlayerIndex].assignedRole;
      this.selectedPlayers[curRolePlayerIndex].assignedRole = this.selectedPlayers[selectedPlayerIndex].assignedRole;
      this.selectedPlayers[selectedPlayerIndex].assignedRole = curPlayerRole;
      this.bonusRoles = [];
    this.bonusRoles.push({role: "Captain", value: "captain" , playerList: this.selectedPlayers , selectedPlayer : this.selectedPlayers.find(o=>o.assignedRole == "captain")?.id});
    this.bonusRoles.push({role: "Vice captain", value: "vcaptain", playerList: this.selectedPlayers, selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "vcaptain")?.id});
    this.bonusRoles.push({role: "Batting hero", value: "battinghero", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "battinghero")?.id});
    this.bonusRoles.push({role: "Bowling hero", value: "bowlinghero", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "bowlinghero")?.id});
    this.bonusRoles.push({role: "Impact Sub 1", value: "player11", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "player11")?.id});
    this.bonusRoles.push({role: "Impact Sub 2", value: "player12", playerList: this.selectedPlayers , selectedPlayer: this.selectedPlayers.find(o=>o.assignedRole == "player12")?.id});
    }
    this.selectedPlayers.sort((a, b) => {
      return this.sortOrder.indexOf(a.assignedRole||"") - this.sortOrder.indexOf(b.assignedRole||"");
    });
  }
  canDeactivate() {
    return true
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Player, Tournament } from 'src/app/@core/models/Player.model';
import { FilterService, MessageService } from 'primeng/api';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ScoreService } from 'src/app/@core/services/score/score.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
export interface COLUMN {
  field: string;
  header: string;
  filter: any[];
}
export interface FILTER {
  name: any;
}

@UntilDestroy({checkProperties:true})
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('dt1') dt1: any;
  @ViewChild('dt2') dt2: any;
  players: Player[] = [];
  selectedPlayers: Player[] = [];
  cols: COLUMN[] = [];
  playerList :Player[] = [];
  tournament:Tournament={} as any;

  public AllRoundersCountLimit = 3;
  public captainCountLimit = 1;
  public viseCaptainCountLimit = 1;
  public teamSizeLimit = 9;
  public wicketKeeperCountLimit = 1;
  public subCountLimit = null;

  public AllRoundersCount = 0;
  public captainCount = 0;
  public viseCaptainCount = 0;
  public teamSize = 0;
  public wicketKeeperCount = 0;
  public subCountUsed = 0;

  private _history: Player[][] = [];

  roleList = [
    { value: '', name: '-Select-', inactive: false },
    { value: 'captain', name: 'Captain', inactive: false },
    { value: 'vcaptain', name: 'Vice-Captain', inactive: false },
    { value: 'player3', name: 'Player 3', inactive: false },
    { value: 'player4', name: 'Player 4', inactive: false },
    { value: 'player5', name: 'Player 5', inactive: false },
    { value: 'player6', name: 'Player 6', inactive: false },
    { value: 'player7', name: 'Player 7', inactive: false },
    { value: 'player8', name: 'Player 8', inactive: false },
    { value: 'player9', name: 'Player 9', inactive: false },
    // { value: 'allrounder', name: 'All-Rounder', inactive: false },
  ];
  lockTime: Date;
  roleCount: number =0;
  constructor(
    private filterService: FilterService,
    private messageService: MessageService,
    private scoreService: ScoreService,
    private router: Router
  ) {
    this.lockTime=moment("19:30","HH:mm",true).toDate();
    console.log(this.lockTime)
   }

  checkUndo() {
    return this._history.length < 1;
  }
  updateSquadHistory(cur: Player[]) {
    this._history.push(_.cloneDeep(cur));
    console.log(this._history)
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
      if(this.subCountLimit) this.subCountUsed++;
      //this.updateSquadHistory(this.selectedPlayers);
    }
  }

  codeToName(value: string): string | undefined {
    return this.roleList.find((o) => o.value == value)?.name;
  }
  ngOnInit(): void {
    
    this.scoreService.userMatchDetails().subscribe((o)=>{
      this.tournament = o;
      this.getPlayerList();
    })
  }

  getPlayerList(){
    this.scoreService.getPlayerList().subscribe((o:any)=>{
      this.playerList = [...o.filter((p:Player)=>p.team==this.tournament.team1),...o.filter((p:Player)=>p.team==this.tournament.team2)].filter(o=>o.active=='active');
      this.cols = [
        { field: 'name', header: 'Player', filter: [] },
        { field: 'team', header: 'Team', filter: [] },
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
    })
  }

  selectPlayer(data: Player, index: number) {
    if (this.selectedPlayers.includes(data)) return;
    this.teamSize = this.selectedPlayers.length;

    if (this.validations(data)) {
      data.roleList = this.roleList;
      this.updateSquadHistory(this.selectedPlayers);
      this.selectedPlayers.push(data);
      this.dt1.clear();
      this.reset();
      this.calculateCounts();
      if(this.subCountLimit) this.subCountUsed++;
      this.showMessage(
        'success',
        'XI Update',
        `Player ${data.name} added to your XI`
      );
    }
  }

  remove(index: number) {
    if (
      confirm(
        'Do you want to remove this player :' +
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
    this.roleCount=0;
    this.AllRoundersCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, 'allrounder')
    ).length;

    this.captainCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, 'captain')
    ).length;

    this.viseCaptainCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, 'vcaptain')
    ).length;
    this.teamSize = this.selectedPlayers.length;
    this.wicketKeeperCount = this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, 'wk')
    ).length;
  }
  processSear(role:string){
   return this.selectedPlayers.filter((o) =>
      this.filterService.filters.equals(o.assignedRole, role)
    ).length>0;
  }
  findFirstRolePlayer(role:string){
    return this.selectedPlayers.find((o) =>
       this.filterService.filters.equals(o.assignedRole, role)
     );
   }
  processDropDown(roleList: any[]): void {
    this.calculateCounts();
    this.roleCount=0;
/*     if (this.AllRoundersCount >= this.AllRoundersCountLimit) {
      roleList.find((o) => o.value == 'allrounder').inactive = true;
    } */
    if (this.processSear('captain')) {
      roleList.find((o) => o.value == 'captain').inactive = true;
      this.roleCount++;
    }else roleList.find((o) => o.value == 'captain').inactive = false;
    if (this.processSear('vcaptain')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'vcaptain').inactive = true;
    } else roleList.find((o) => o.value == 'vcaptain').inactive = false;
    if (this.processSear('player3')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'player3').inactive = true;
    } else roleList.find((o) => o.value == 'player3').inactive = false;
    if (this.processSear('player4')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'player4').inactive = true;
    } else roleList.find((o) => o.value == 'player4').inactive = false;
    if (this.processSear('player5')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'player5').inactive = true;
    }else roleList.find((o) => o.value == 'player5').inactive = false;
    if (this.processSear('player6')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'player6').inactive = true;
    } else roleList.find((o) => o.value == 'player6').inactive = false;
    if (this.processSear('player7')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'player7').inactive = true;
    } else roleList.find((o) => o.value == 'player7').inactive = false;
    if (this.processSear('player8')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'player8').inactive = true;
    } else roleList.find((o) => o.value == 'player8').inactive = false;
    if (this.processSear('player9')) {
      this.roleCount++;
      roleList.find((o) => o.value == 'player9').inactive = true;
    } else roleList.find((o) => o.value == 'player9').inactive = false;
  }
  validations(data: Player): boolean {
    this.calculateCounts();
    if (this.teamSize >= this.teamSizeLimit) {
      this.showMessage(
        'error',
        'Block',
        `A team cannot have more than ${this.teamSizeLimit} players`
      );
      return false;
    } else return true;
  }

  private showMessage(
    severity: string = 'success',
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
  submitXI(selectedPlayers:Player[]){
    const roles = this.roleList.filter(o=>o.value!='').map(o=>o.value);
    let data={
      matchNo: this.tournament.matchNo,
      username: '',
      rank_no: 0,
      total: 0,
      captain: 0,
      vcaptain: 0,
      player3: 0,
      player4: 0,
      player5: 0,
      player6: 0,
      player7: 0,
      player8: 0,
      player9: 0,
      captainPoint: 0,
      vcaptainPoint: 0,
      player3Point: 0,
      player4Point: 0,
      player5Point: 0,
      player6Point: 0,
      player7Point: 0,
      player8Point: 0,
      player9Point: 0
    } as any;
    roles.forEach(role=>{
      data[role] = this.findFirstRolePlayer(role)?.id
    })
   this.scoreService.updateDream9Details(data).subscribe(o=>{
    if(o){
      alert("Done. Updated")
    }else {
      this.scoreService.userMatchDetails().subscribe((o)=>{
        if(o.started || !o.enable11){
          alert("Not Updated. Either Game started or Dream 9 Session closed.")
          this.router.navigate(["./rank"])
        }
      })
    }
   })
  }

  canDeactivate(){ return false}
}

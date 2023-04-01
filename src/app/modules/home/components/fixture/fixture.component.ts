import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { map, Observable, tap } from 'rxjs';
import { Tournament } from 'src/app/@core/models/Player.model';
import { Points } from 'src/app/@core/models/points';
import { AppState } from 'src/app/@core/redux/app.state';
import { addPushMessage } from 'src/app/@core/redux/login/login.action';
import { selectMsg } from 'src/app/@core/redux/login/login.selector';
import { ScoreService } from 'src/app/@core/services/score/score.service';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.scss']
})
export class FixtureComponent implements OnInit {
  tournaments$: Observable<Tournament[]> = null as any;
  yourTeamSetUp$: Observable<Points[]> = null as any;
  totalPoints: number = 0;

  constructor(private scoreService: ScoreService, private route: ActivatedRoute, private router: Router,public store: Store<AppState>,private messageService: MessageService,) { }
 
  ngOnInit(): void {
    this.tournaments$ = this.scoreService.getTournaments().pipe(map(o=>{
      return o.filter(p=>p.enable11);
    }));

    this.yourTeamSetUp$ = this.scoreService.scoreSplitForPlayers().pipe(tap(o=>{
      this.totalPoints 
      o.forEach(p => {
        this.totalPoints = this.totalPoints + p.total;
      })
    }));

    (this.store.select(selectMsg) as Observable<any>).subscribe(o=>{
      if(o["msg"] == '' || o["read"]==true) return;
      this.showMessage(
        "success",
        "Message from Admin",
        o["msg"]
      );
      this.store.dispatch(addPushMessage({payload:{'msg':o["msg"],read:true}}));
    })
  }
  goToPlayerDashboard(matchNo:string,enable11:boolean): void { 
    if(!enable11){
      this.showMessage(
        "Error",
        "",
        "This match is not enabled."
      );
      return;
    }
    this.router.navigateByUrl(`/home/playerDashboard/${matchNo}`)
  }

  canDeactivate() {
    return true;
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

}

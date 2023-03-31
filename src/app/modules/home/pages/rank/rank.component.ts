import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { Observable, timer } from 'rxjs';
import { Tournament } from 'src/app/@core/models/Player.model';
import { Points } from 'src/app/@core/models/points';
import { AppState } from 'src/app/@core/redux/app.state';
import { addPushMessage } from 'src/app/@core/redux/login/login.action';
import { selectMsg } from 'src/app/@core/redux/login/login.selector';
import { ScoreService } from 'src/app/@core/services/score/score.service';

@UntilDestroy({checkProperties:true})
@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.scss']
})
export class RankComponent implements OnInit {
  tournament:Tournament | undefined;
  points: Points | undefined;
  rank = [] as any;
  lastUpdatedTime: string = "";

  constructor(private scoreService:ScoreService,public store: Store<AppState>,private messageService: MessageService,) { }

  ngOnInit(): void {
    this.refreshScore();
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

  canDeactivate():boolean { return true}

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

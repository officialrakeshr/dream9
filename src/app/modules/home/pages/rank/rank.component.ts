import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { Tournament } from 'src/app/@core/models/Player.model';
import { Points } from 'src/app/@core/models/points';
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

  constructor(private scoreService:ScoreService) { }

  ngOnInit(): void {
    this.scoreService.userMatchDetails().subscribe((o)=>{
      this.tournament = o;
    })
    this.refreshScore();
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

  canDeactivate():boolean { return true}

}

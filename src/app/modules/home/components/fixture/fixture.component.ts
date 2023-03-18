import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Tournament } from 'src/app/@core/models/Player.model';
import { ScoreService } from 'src/app/@core/services/score/score.service';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.scss']
})
export class FixtureComponent implements OnInit {
  tournaments$: Observable<Tournament[]> = null as any;

  constructor(private scoreService: ScoreService, private route: ActivatedRoute, private router: Router,) { }
 
  ngOnInit(): void {
    this.tournaments$ = this.scoreService.getTournaments().pipe(map(o=>{
      return o.filter(p=>p.enable11);
    }));
  }
  goToPlayerDashboard(matchNo:string,enable11:boolean): void { 
    if(!enable11){
      alert("This match is not enabled");
      return;
    }
    this.router.navigateByUrl(`/home/playerDashboard/${matchNo}`)
  }

  canDeactivate() {
    return true;
  }

}

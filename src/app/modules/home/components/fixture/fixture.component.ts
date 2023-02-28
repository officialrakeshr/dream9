import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Tournament } from 'src/app/@core/models/Player.model';
import { ScoreService } from 'src/app/@core/services/score/score.service';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.scss']
})
export class FixtureComponent implements OnInit {
  tournaments$: Observable<Tournament[]> = null as any;

  constructor(private scoreService: ScoreService) { }
 
  ngOnInit(): void {
    this.tournaments$ = this.scoreService.getTournaments();
  }

}

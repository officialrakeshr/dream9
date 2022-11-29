import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchDetails, Tournament } from 'src/app/@core/models/Player.model';
import { ScoreService } from 'src/app/@core/services/score/score.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  selectedMatch!:Tournament;
  playerOptions=[{name:'Active',value:'active'},{name:'Inactive',value:'inactive'}]
  matchDetails$: Observable<MatchDetails> | undefined;
  constructor(private scoreService:ScoreService) { }
  tournaments$=this.scoreService.getTournaments();
  ngOnInit(): void {
  }

  getMatchDetails(optionValue:any){
    this.matchDetails$ = this.scoreService.getMatchDetails(optionValue.matchNo)
  }

  updatePlayers(matchDetails:MatchDetails){
    this.scoreService.updateMatchDetails(matchDetails).subscribe();
  }

  enableDream9(selectedMatch:Tournament){
    selectedMatch={...selectedMatch,enable11:true}
    this.scoreService.updateTournament(selectedMatch).subscribe(o=>{
      window.location.reload();
    });
  }
  closeDream9(selectedMatch:Tournament){
    selectedMatch={...selectedMatch,enable11:true}
    this.scoreService.updateTournament(selectedMatch).subscribe(o=>{
      window.location.reload();
    });
  }

}

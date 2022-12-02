import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UntilDestroy } from "@ngneat/until-destroy";
import { Observable } from "rxjs";
import { MatchDetails, Tournament } from "src/app/@core/models/Player.model";
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
  newUniqueId = "";
  selectedMatchNo = "";
  selectedMatch!: Tournament;
  playerOptions = [
    { name: "Active", value: "active" },
    { name: "Inactive", value: "inactive" },
  ];
  matchDetails$: Observable<MatchDetails> | undefined;
  constructor(
    private scoreService: ScoreService,
    private userService: UserService,
    private router: Router
  ) {}
  tournaments$ = this.scoreService.getTournaments();
  ngOnInit(): void {}

  getMatchDetails(optionValue: any) {
    this.matchDetails$ = this.scoreService.getMatchDetails(optionValue.matchNo);
  }

  updatePlayers(matchDetails: MatchDetails) {
    this.scoreService.updateMatchDetails(matchDetails).subscribe();
  }

  enableDream9(selectedMatch: Tournament) {
    selectedMatch = { ...selectedMatch, enable11: true };
    this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
      let currentUrl = this.router.url;
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    });
  }
  closeDream9(selectedMatch: Tournament) {
    selectedMatch = { ...selectedMatch, enable11: false };
    this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
      let currentUrl = this.router.url;
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    });
  }

  startMatch(selectedMatch: Tournament) {
    selectedMatch = { ...selectedMatch, enable11: false, started: true };
    this.scoreService.updateTournament(selectedMatch).subscribe((o) => {
      let currentUrl = this.router.url;
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    });
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

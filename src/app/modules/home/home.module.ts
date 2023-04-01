import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { StatComponent } from './pages/stat/stat.component';
import { PrimengModule } from 'src/app/@shared/modules/primeng/primeng.module';
import { CoreModule } from 'src/app/@core/core.module';
import { CountDownComponent } from './components/count-down/count-down.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from 'src/app/@core/interceptors/jwt.interceptor';
import { ScoreService } from 'src/app/@core/services/score/score.service';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ScorebookComponent } from './pages/scorebook/scorebook.component';
import { PlayerGuard } from 'src/app/@core/guards/player-guard';
import { AdminGuard } from 'src/app/@core/guards/admin-guard';
import { CanDeactivateGuard } from 'src/app/@core/guards/deactivate-guard';
import { RankComponent } from './pages/rank/rank.component';
import { FixtureComponent } from './components/fixture/fixture.component';

@NgModule({
  declarations: [DashboardComponent, StatComponent, CountDownComponent, AdminDashboardComponent, ScorebookComponent, RankComponent, FixtureComponent],
  imports: [
    CommonModule,
    PrimengModule,
    CoreModule,
    RouterModule.forChild([{ path: 'playerDashboard/:matchNo', component: DashboardComponent , canActivate:[PlayerGuard], canDeactivate:[CanDeactivateGuard] },
    { path: 'adminDashboard', component: AdminDashboardComponent, canActivate:[AdminGuard], canDeactivate:[CanDeactivateGuard] },
    { path: 'scorebook/:matchNo', component: ScorebookComponent ,canActivate:[AdminGuard] , canDeactivate:[CanDeactivateGuard] },
    { path: 'rank', component: RankComponent, canDeactivate:[CanDeactivateGuard]},
    { path: 'fixture', component: FixtureComponent, canActivate:[PlayerGuard], canDeactivate:[CanDeactivateGuard]}]),
  ],
  providers:[
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    ScoreService,
    PlayerGuard,
    AdminGuard,
    CanDeactivateGuard
  ]
})
export class HomeModule {}

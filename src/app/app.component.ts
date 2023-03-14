import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './@core/redux/app.state';
import { selectUser } from './@core/redux/login/login.selector';
import DisableDevtool from 'disable-devtool';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs';
import { User } from './@core/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'acl-game';
  user: User = null as any
  user$ = this.store.select(selectUser).pipe(tap(o=>{
    this.user = o;
  }));
  
  constructor(private store: Store<AppState>,private route: ActivatedRoute, private router: Router) {
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "Unsaved modifications";
      return event;
   });
   if(environment.production){
    DisableDevtool({disableMenu:true,clearLog:true,ondevtoolopen:()=>{
      alert("You are awarded A TOP")
     }})
   }
  }
  gotoHomePage(){
    if(this.user.role=='player'){
      this.router.navigate(['./home/fixture']);
    }else{
      this.router.navigate(['./home/adminDashboard']);
    }
    this.store.select(selectUser)
  }
}

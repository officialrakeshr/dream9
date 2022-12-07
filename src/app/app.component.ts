import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './@core/redux/app.state';
import { selectUser } from './@core/redux/login/login.selector';
import DisableDevtool from 'disable-devtool';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'acl-game';
  user$ = this.store.select(selectUser);
  constructor(private store: Store<AppState>) {
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
}

import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './@core/redux/app.state';
import { selectUser } from './@core/redux/login/login.selector';
import DisableDevtool from 'disable-devtool';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs';
import { User } from './@core/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketAPI } from './WebSocketAPI';
import { WebsocketComponent } from './websocket/websocket.component';
import { MessageService } from 'primeng/api';
import { UserService } from './@core/services/user/user.service';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy({checkProperties:true})
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  webSocketAPI:any;
  greeting: any;
  name: string='';
  title = 'acl-game';
  user: User = null as any
  user$ = this.store.select(selectUser).pipe(tap(o=>{
    this.user = o;
  }));
  
  constructor(private store: Store<AppState>,private route: ActivatedRoute, private router: Router,private messageService: MessageService,private api: UserService) {
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "Unsaved modifications";
      return event;
   });
   if(environment.production){
    DisableDevtool({disableMenu:true,clearLog:true,ondevtoolopen:()=>{
      this.api.attemptHack().subscribe(o=>{
        alert("This is a prohibited action. Hacking actions will be logged and take necessary actions against the user.");
      })
     }})
   }
   this.webSocketAPI = new WebSocketAPI(new WebsocketComponent(store));
   this.connect();
  }
  ngOnDestroy(): void {
    this.disconnect();
  }
  gotoHomePage(){
    if(this.user.role=='player'){
      this.router.navigate(['./home/fixture']);
    }else{
      this.router.navigate(['./home/adminDashboard']);
    }
    this.store.select(selectUser)
  }

  
  connect(){
    try {
      this.webSocketAPI._connect();
    } catch (error) {
      console.log("Websocket connection error: " + error);
    }
  }

  disconnect(){
    try {
      this.webSocketAPI._disconnect();
    } catch (error) {
      console.log("Websocket connection error: " + error);
    } 
  }

  sendMessage(){
    try {
      this.webSocketAPI._send(this.name);
    } catch (error) {
      console.log("Websocket send message error: " + error);
    }
  }
}

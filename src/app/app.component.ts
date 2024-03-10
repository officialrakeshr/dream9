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
  
  constructor(private store: Store<AppState>,private router: Router,private api: UserService) {
    fetch('http://worldtimeapi.org/api/ip')
    .then(response => response.json())
    .then(data => {
      const serverTime = new Date(data.utc_datetime);
      const clientTime = new Date();
      
      // Calculate the time difference between server and client
      const timeDifference = Math.abs(serverTime.getTime() - clientTime.getTime());
      
      // Define the maximum allowed time difference (in milliseconds)
      const maxTimeDifference = 30000; // 30 seconds

      if (timeDifference <= maxTimeDifference) {
          console.log("Server and client time are within acceptable range.");
          // Proceed with further actions
      } else {
          if(confirm("Warning: Changing your system time may result in restricted access or other consequences. Please correct the system time, close the application window, and try again!")){
            window.location.reload();
          }else {
            window.location.reload();
          };
          // Take appropriate action (e.g., display error message, block action)
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
   if(environment.production){
    DisableDevtool({disableMenu:true, clearLog:true,ondevtoolopen:()=>{
      if(sessionStorage.getItem("role")=="admin") return;
      if(sessionStorage.getItem("role")!="admin"){
        if(this.user && this.user.role!=null && this.user.role!=''){
          this.api.attemptHack().subscribe(()=>{
            alert("This is a prohibited action. Hacking actions will be logged and take necessary actions against the user.");
            this.disconnect();
            window.location.assign("https://en.wikipedia.org/wiki/Anonymous_(hacker_group)")
          })
        }else {
          alert("This is a prohibited action. Hacking actions will be logged and take necessary actions against the user.");
          this.disconnect();
          window.location.assign("https://en.wikipedia.org/wiki/Anonymous_(hacker_group)")
        }
      }
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

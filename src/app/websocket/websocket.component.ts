import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../@core/redux/app.state';
import { addPushMessage } from '../@core/redux/login/login.action';

@Component({
  selector: 'app-websocket',
  templateUrl: './websocket.component.html',
  styleUrls: ['./websocket.component.scss']
})
export class WebsocketComponent implements OnInit {

  constructor(public store: Store<AppState>) { }

  ngOnInit(): void {
  }
  alertThis(msg:string){
    this.store.dispatch(addPushMessage({payload:{'msg':msg,read:false}}));
  }
}

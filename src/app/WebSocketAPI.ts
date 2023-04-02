import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { WebsocketComponent } from './websocket/websocket.component';

export class WebSocketAPI {
    webSocketEndPoint: string = `${environment.baseUrl}/websocket/ws`;
    topic1: string = "/topic/reloadPage";
    topic2: string = "/topic/pushMessage";
    stompClient: any;
    websocketComponent: WebsocketComponent;
    constructor(websocketComponent: WebsocketComponent){
        this.websocketComponent = websocketComponent;
    }
    _connect() {
        console.log("Initialize WebSocket Connection");
        let ws = new SockJS(this.webSocketEndPoint);
        this.stompClient = Stomp.over(ws);
        const _this = this;
        _this.stompClient.connect({}, function (_frame: any) {
            _this.stompClient.subscribe(_this.topic1, function (sdkEvent: any) {
                _this.onMessageReceived(sdkEvent);
            });
            _this.stompClient.subscribe(_this.topic2, function (sdkEvent: any) {
                _this.onMessageReceived2(sdkEvent);
            });
            //_this.stompClient.reconnect_delay = 2000;
        }, this.errorCallBack.bind(this));
    };

    _disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    // on error, schedule a reconnection attempt
    errorCallBack(error: string) {
        alert("Server Down / Internet connectivity issues. Reconnecting...");
        setTimeout(() => {
            this._connect();
        }, 5000);
    }

	/**
	 * Send message to sever via web socket
	 * @param {*} message 
	 */
    _send(message: string) {
        this.stompClient.send("/webSocket/hello", {}, JSON.stringify(message));
    }

    onMessageReceived(message:any) {
        if(sessionStorage.getItem('role')==="player"){
            alert("Admin requested a  page refresh. Your screen will be refreshed.");
            window.location.reload();
        }
        // else{
        //     window.location.reload();
        // }
    }
    onMessageReceived2(message:any) {
        console.log(message.body)
        this.websocketComponent.alertThis(message.body);
    }
}
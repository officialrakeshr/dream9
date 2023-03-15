import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { WebsocketComponent } from './websocket/websocket.component';

export class WebSocketAPI {
    webSocketEndPoint: string = `${environment.baseUrl}/websocket/ws`;
    topic1: string = "/topic/greetings";
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
        }, this.errorCallBack);
    };

    _disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    // on error, schedule a reconnection attempt
    errorCallBack(error: string) {
        alert("Service Down.Please Logout and try again later");
       /*  console.log("errorCallBack -> " + error)
        setTimeout(() => {
            this._connect();
        }, 5000); */
    }

	/**
	 * Send message to sever via web socket
	 * @param {*} message 
	 */
    _send(message: string) {
        console.log("calling logout api via web socket");
        this.stompClient.send("/webSocket/hello", {}, JSON.stringify(message));
    }

    onMessageReceived(message:any) {
        console.log("Message Recieved from Server 1:: " + message);
    }
    onMessageReceived2(message:any) {
        console.log(message.body)
        this.websocketComponent.alertThis(message.body);
    }
}
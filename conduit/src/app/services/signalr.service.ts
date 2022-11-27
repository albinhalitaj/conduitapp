import { Inject, Injectable } from '@angular/core';
import * as signal from '@microsoft/signalr';
import { HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { SIGNALR_URL } from '../app.component';

@Injectable({ providedIn: 'root' })
export class SignalrService {

  constructor(@Inject(SIGNALR_URL) private signalr_url: string) {}

  private connection: signal.HubConnection = new signal.HubConnectionBuilder()
    .withUrl(this.signalr_url)
    .build();

  private serverResponse: BehaviorSubject<any> = new BehaviorSubject<any>('');
  serverResponseAction$ = this.serverResponse.asObservable();

  startConnection() {
    if (this.connection.state === HubConnectionState.Connected) return;
    this.connection
      .start()
      .then(() => console.log('Connected'))
      .catch((err) => console.error("Error while connecting with the server: ", err));

    this.connection.on('articleRetrive', (data: any) => {
      this.serverResponse.next(data);
    });
  }

  closeConnection() {
    if (this.connection.state === HubConnectionState.Disconnected) return;
    this.connection
      .stop()
      .then(() => console.log('Disconnected'))
      .catch((err) => console.error(err));
  }

  sendMessage() {
    this.connection
      .invoke('Server', 'hello')
      .then((response) => console.log('response', response))
      .catch((err) => console.error(err));
  }
}

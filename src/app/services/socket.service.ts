// socket.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: SocketIOClient.Socket;
  private apiUrl = 'http://localhost:8000'; // Your Django backend URL

  constructor() {
    this.socket = io(this.apiUrl);
  }

  sendMessage(message: string): void {
    this.socket.emit('message', message);
  }

  receiveMessage(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('message', (data: string) => {
        observer.next(data);
      });
    });
  }
}

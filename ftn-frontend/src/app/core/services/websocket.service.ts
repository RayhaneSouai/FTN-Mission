import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

export interface AppNotificationDTO {
  id: number;
  type: string;
  title: string;
  message: string;
  clubId?: number;
  clubName?: string;
  season?: string;
  createdByName?: string;
  payload?: string;
  licenseId?: number;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private notificationsSubject = new BehaviorSubject<AppNotificationDTO | null>(null);
  public notifications$ = this.notificationsSubject.asObservable();
  private apiUrl = 'http://localhost:8083/ftn';

  constructor(private authService: AuthService) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.apiUrl + '/ws'),
      debug: (msg: string) => console.log(msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      let currentUser = null;
      if (typeof sessionStorage !== 'undefined') {
        const userStr = sessionStorage.getItem('user');
        if (userStr) currentUser = JSON.parse(userStr);
      }
      
      if (currentUser) {
        const role = currentUser.role;
        if (role === 'ADMIN') {
          this.client.subscribe('/topic/notifications/role/ADMIN', (message: IMessage) => {
            this.notificationsSubject.next(JSON.parse(message.body));
          });
        } else {
          this.client.subscribe('/topic/notifications/' + currentUser.id, (message: IMessage) => {
            this.notificationsSubject.next(JSON.parse(message.body));
          });
        }
      }
    };
  }

  public connect(): void {
    const isLoggedIn = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn && !this.client.active) {
      this.client.activate();
    }
  }

  public disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }
}

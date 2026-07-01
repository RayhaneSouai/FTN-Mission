import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../core/config/api.config';

export interface AppNotification {
  id: number;
  type: 'CLUB_ADMIN_ERROR' | 'SEASON_VALIDATION_REQUEST';
  title: string;
  message: string;
  clubId?: number;
  clubName?: string;
  season?: string;
  createdByName?: string;
  payload?: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = apiUrl('notifications');

  constructor(private http: HttpClient) {}

  getAdminNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/admin`);
  }

  getAdminUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/admin/unread-count`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAdminAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/read-all`, {});
  }

  getMyNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/my-notifications`);
  }

  getMyUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SwimmerService {
  private api = 'http://localhost:8083/ftn/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/athlete/profile`, { headers: this.getHeaders() });
  }

  getProgress(): Observable<any> {
    return this.http.get(`${this.api}/athlete/progress`, { headers: this.getHeaders() });
  }

  getCompetitions(): Observable<any> {
    return this.http.get(`${this.api}/competitions`, { headers: this.getHeaders() });
  }

  getMyParticipations(): Observable<any> {
    return this.http.get(`${this.api}/competitions/my-participations`, { headers: this.getHeaders() });
  }

  getNews(): Observable<any> {
    return this.http.get(`${this.api}/press/getAll`, { headers: this.getHeaders() });
  }

  getDashboardStats(userId: number): Observable<any> {
    return this.http.get(`${this.api}/users/${userId}/dashboard-stats`, { headers: this.getHeaders() });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8083/ftn/api/auth';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset-request`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset`, data);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = apiUrl('auth');
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    if (typeof sessionStorage !== 'undefined') {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        this.currentUserSubject.next(JSON.parse(userStr));
      }
    }
  }

  setUser(user: any) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('isLoggedIn', 'true');
    }
    this.currentUserSubject.next(user);
  }

  logout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset-request`, { email });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/password-reset/validate/${encodeURIComponent(token)}`);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset`, data);
  }
}

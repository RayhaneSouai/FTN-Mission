import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../core/config/api.config';
import { AdminUserCreateRequest, AdminUserCreateResponse } from '../models/admin-user-create.model';
import { BulkImportResponse } from '../user-import/models/user-import.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = apiUrl('users');

  constructor(private http: HttpClient) { }

  // Récupère le token du localStorage
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { 
      headers: this.getHeaders()
    });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders()
    });
  }

  createUser(userData: AdminUserCreateRequest): Observable<AdminUserCreateResponse> {
    return this.http.post<AdminUserCreateResponse>(this.apiUrl, userData, {
      headers: this.getHeaders()
    });
  }

  bulkImportUsers(users: AdminUserCreateRequest[]): Observable<BulkImportResponse> {
    return this.http.post<BulkImportResponse>(`${this.apiUrl}/import`, { users }, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData, { 
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders()
    });
  }

  approveUser(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, {}, { 
      headers: this.getHeaders()
    });
  }

  rejectUser(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reject`, {}, { 
      headers: this.getHeaders()
    });
  }

  changePassword(changePasswordData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, changePasswordData, { 
      headers: this.getHeaders()
    });
  }

  requestPasswordChange(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/request-password-change`, {}, { 
      headers: this.getHeaders()
    });
  }

  getAdminDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-stats`, { 
      headers: this.getHeaders()
    });
  }
}

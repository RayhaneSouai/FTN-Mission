import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club, ClubJoinRequest } from '../models/club.model';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class ClubService {
  private readonly apiUrl = apiUrl('clubs');

  constructor(private http: HttpClient) {}

  getAll(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl);
  }

  findByName(name: string): Observable<Club | null> {
    return this.http.get<Club | null>(this.apiUrl, { params: { name } });
  }

  getTopClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/ranking`);
  }

  getStatistics(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }

  requestToJoin(id: number, message?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/join-request`, { message: message ?? '' });
  }

  getMyClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/my-clubs`);
  }

  getMyJoinRequests(): Observable<ClubJoinRequest[]> {
    return this.http.get<ClubJoinRequest[]>(`${this.apiUrl}/my-join-requests`);
  }

  getPendingJoinRequests(): Observable<ClubJoinRequest[]> {
    return this.http.get<ClubJoinRequest[]>(`${this.apiUrl}/join-requests`);
  }

  approveJoinRequest(requestId: number): Observable<ClubJoinRequest> {
    return this.http.put<ClubJoinRequest>(`${this.apiUrl}/join-requests/${requestId}/approve`, {});
  }

  rejectJoinRequest(requestId: number): Observable<ClubJoinRequest> {
    return this.http.put<ClubJoinRequest>(`${this.apiUrl}/join-requests/${requestId}/reject`, {});
  }

  create(club: Club): Observable<Club> {
    return this.http.post<Club>(this.apiUrl, club);
  }

  createByName(name: string): Observable<Club> {
    return this.create({ name });
  }

  update(id: number, club: Club): Observable<Club> {
    return this.http.put<Club>(`${this.apiUrl}/${id}`, club);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

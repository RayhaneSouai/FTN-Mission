import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({ providedIn: 'root' })
export class ClubService {
  private apiUrl = 'http://localhost:8083/ftn/api/clubs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl);
  }

  getTopClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/ranking`);
  }

  getStatistics(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }

  create(club: Club): Observable<Club> {
    return this.http.post<Club>(this.apiUrl, club);
  }

  update(id: number, club: Club): Observable<Club> {
    return this.http.put<Club>(`${this.apiUrl}/${id}`, club);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

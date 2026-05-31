import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Season } from '../models/formation.model';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private apiUrl = apiUrl('formation/seasons');

  constructor(private http: HttpClient) {}

  getAll(): Observable<Season[]> {
    return this.http.get<Season[]>(this.apiUrl);
  }

  create(season: Season): Observable<Season> {
    return this.http.post<Season>(this.apiUrl, season);
  }

  update(id: number, season: Season): Observable<Season> {
    return this.http.put<Season>(`${this.apiUrl}/${id}`, season);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

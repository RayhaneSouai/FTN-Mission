import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Season } from '../models/formation.model';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private apiUrl = apiUrl('formation/seasons');

  constructor(private http: HttpClient) {}

  getAll(): Observable<Season[]> {
    return this.http.get<Season[]>(this.apiUrl);
  }

  getActive(): Observable<Season | null> {
    return this.http.get<Season>(`${this.apiUrl}/active`, { observe: 'response' }).pipe(
      map((res) => (res.status === 204 || !res.body ? null : res.body)),
      catchError(() => of(null))
    );
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

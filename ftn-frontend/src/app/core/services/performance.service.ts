import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerformanceRequest, PerformanceResponse } from '../models/performance.model';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8083/ftn/api/performances';

  getAll(): Observable<PerformanceResponse[]> {
    return this.http.get<PerformanceResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<PerformanceResponse> {
    return this.http.get<PerformanceResponse>(`${this.apiUrl}/${id}`);
  }

  getBySwimmer(swimmerId: number): Observable<PerformanceResponse[]> {
    return this.http.get<PerformanceResponse[]>(`${this.apiUrl}/swimmer/${swimmerId}`);
  }

  create(dto: PerformanceRequest): Observable<PerformanceResponse> {
    return this.http.post<PerformanceResponse>(this.apiUrl, dto);
  }

  update(id: number, dto: PerformanceRequest): Observable<PerformanceResponse> {
    return this.http.put<PerformanceResponse>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerformanceResponse } from '../models/performance.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8083/ftn/api/performances';

  getBySwimmer(swimmerId: number): Observable<PerformanceResponse[]> {
    return this.http.get<PerformanceResponse[]>(
      `${this.apiUrl}/swimmer/${swimmerId}`
    );
  }

  getAll(): Observable<PerformanceResponse[]> {
    return this.http.get<PerformanceResponse[]>(this.apiUrl);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordDTO } from '../models/performance.model';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8083/ftn/api/records';

  getAllNationalRecords(): Observable<RecordDTO[]> {
    return this.http.get<RecordDTO[]>(`${this.apiUrl}/national`);
  }

  getPersonalRecords(swimmerId: number): Observable<RecordDTO[]> {
    return this.http.get<RecordDTO[]>(`${this.apiUrl}/personal/${swimmerId}`);
  }

  getNationalRecordForEvent(distance: number, stroke: string, gender: string): Observable<RecordDTO> {
    const params = new HttpParams()
      .set('distance', distance.toString())
      .set('stroke', stroke)
      .set('gender', gender);
    return this.http.get<RecordDTO>(`${this.apiUrl}/national/event`, { params });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordDTO } from '../../../core/models/performance.model';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = apiUrl('records');

  getAllNationalRecords(): Observable<RecordDTO[]> {
    return this.http.get<RecordDTO[]>(`${this.baseUrl}/national`);
  }

  getPersonalRecords(swimmerId: number): Observable<RecordDTO[]> {
    return this.http.get<RecordDTO[]>(`${this.baseUrl}/personal/${swimmerId}`);
  }

  getNationalRecordForEvent(distance: number, stroke: string, gender: string): Observable<RecordDTO> {
    const params = new HttpParams()
      .set('distance', distance.toString())
      .set('stroke', stroke)
      .set('gender', gender);
    return this.http.get<RecordDTO>(`${this.baseUrl}/national/event`, { params });
  }
}

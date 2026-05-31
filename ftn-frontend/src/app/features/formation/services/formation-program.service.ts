import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormationProgram } from '../models/formation.model';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class FormationProgramService {
  private apiUrl = apiUrl('formation/programs');

  constructor(private http: HttpClient) {}

  getBySeason(seasonId: number): Observable<FormationProgram[]> {
    return this.http.get<FormationProgram[]>(`${this.apiUrl}?seasonId=${seasonId}`);
  }

  getById(id: number): Observable<FormationProgram> {
    return this.http.get<FormationProgram>(`${this.apiUrl}/${id}`);
  }

  create(program: FormationProgram): Observable<FormationProgram> {
    return this.http.post<FormationProgram>(this.apiUrl, program);
  }

  update(id: number, program: FormationProgram): Observable<FormationProgram> {
    return this.http.put<FormationProgram>(`${this.apiUrl}/${id}`, program);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

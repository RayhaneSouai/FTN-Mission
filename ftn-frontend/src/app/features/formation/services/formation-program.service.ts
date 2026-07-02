import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormationCertificate, FormationProgram, FormationRegistration } from '../models/formation.model';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class FormationProgramService {
  private apiUrl = apiUrl('formation/programs');
  private formationApiUrl = apiUrl('formation');

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

  register(programId: number): Observable<FormationRegistration> {
    return this.http.post<FormationRegistration>(`${this.apiUrl}/${programId}/registrations`, {});
  }

  checkEligibility(programId: number): Observable<{ eligible: boolean; explanation: string }> {
    return this.http.post<{ eligible: boolean; explanation: string }>(
      `${this.apiUrl}/${programId}/check-eligibility`, {}
    );
  }

  getMyRegistrations(): Observable<FormationRegistration[]> {
    return this.http.get<FormationRegistration[]>(`${this.formationApiUrl}/my-registrations`);
  }

  getMyHistory(): Observable<FormationRegistration[]> {
    return this.http.get<FormationRegistration[]>(`${this.formationApiUrl}/my-history`);
  }

  getMyCertificates(): Observable<FormationCertificate[]> {
    return this.http.get<FormationCertificate[]>(`${this.formationApiUrl}/my-certificates`);
  }

  verifyCertificate(code: string): Observable<FormationCertificate> {
    return this.http.get<FormationCertificate>(`${this.formationApiUrl}/certificates/verify/${encodeURIComponent(code)}`);
  }
}

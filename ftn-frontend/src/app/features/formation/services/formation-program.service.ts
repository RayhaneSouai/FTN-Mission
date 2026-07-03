import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormationCertificate, FormationProgram, FormationRegistration, TrainingSession } from '../models/formation.model';
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

  getEligiblePrograms(): Observable<FormationProgram[]> {
    return this.http.get<FormationProgram[]>(`${this.apiUrl}/eligible`);
  }

  getCoachPrograms(seasonId?: number): Observable<FormationProgram[]> {
    const params: Record<string, string> = {};
    if (seasonId) params['seasonId'] = String(seasonId);
    return this.http.get<FormationProgram[]>(`${this.apiUrl}/coach-programs`, { params });
  }

  getSwimmerPrograms(seasonId?: number): Observable<FormationProgram[]> {
    const params: Record<string, string> = {};
    if (seasonId) params['seasonId'] = String(seasonId);
    return this.http.get<FormationProgram[]>(`${this.apiUrl}/swimmer-programs`, { params });
  }

  // ─── Training sessions (swimmer programs) ───────────────────────────────────

  getSessions(programId: number): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(`${this.apiUrl}/${programId}/sessions`);
  }

  createSession(programId: number, session: TrainingSession): Observable<TrainingSession> {
    return this.http.post<TrainingSession>(`${this.apiUrl}/${programId}/sessions`, session);
  }

  updateSession(programId: number, sessionId: number, session: TrainingSession): Observable<TrainingSession> {
    return this.http.put<TrainingSession>(`${this.apiUrl}/${programId}/sessions/${sessionId}`, session);
  }

  deleteSession(programId: number, sessionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${programId}/sessions/${sessionId}`);
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

  checkEligibility(swimmerId: number, programId: number): Observable<any> {
    return this.http.post<any>(`${this.formationApiUrl}/check-eligibility`, { swimmerId, programId });
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

  downloadCertificate(registrationId: number): Observable<Blob> {
    return this.http.get(`${this.formationApiUrl}/registrations/${registrationId}/certificate/download`, { responseType: 'blob' });
  }

  adminGenerateCertificate(registrationId: number): Observable<Blob> {
    return this.http.post(`${this.formationApiUrl}/registrations/${registrationId}/generate-certificate`, {}, { responseType: 'blob' });
  }

  // ─── Admin registration workflow ────────────────────────────────────────────

  getAdminRegistrations(seasonId?: number, status?: string): Observable<FormationRegistration[]> {
    const params: Record<string, string> = {};
    if (seasonId) params['seasonId'] = String(seasonId);
    if (status) params['status'] = status;
    return this.http.get<FormationRegistration[]>(`${this.formationApiUrl}/admin/registrations`, { params });
  }

  approveRegistration(registrationId: number): Observable<FormationRegistration> {
    return this.http.put<FormationRegistration>(`${this.formationApiUrl}/admin/registrations/${registrationId}/approve`, {});
  }

  rejectRegistration(registrationId: number, reason?: string): Observable<FormationRegistration> {
    return this.http.put<FormationRegistration>(`${this.formationApiUrl}/admin/registrations/${registrationId}/reject`, { reason });
  }

  waitlistRegistration(registrationId: number): Observable<FormationRegistration> {
    return this.http.put<FormationRegistration>(`${this.formationApiUrl}/admin/registrations/${registrationId}/waitlist`, {});
  }
}

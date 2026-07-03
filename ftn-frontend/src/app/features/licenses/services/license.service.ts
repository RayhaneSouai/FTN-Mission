import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private apiUrl = 'http://localhost:8083/ftn/api/licenses';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllLicenses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getLicenseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createLicense(licenseData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, licenseData, { headers: this.getHeaders() });
  }

  updateLicense(id: number, licenseData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, licenseData, { headers: this.getHeaders() });
  }

  deleteLicense(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  generateLicenses(season: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/generate?season=${season}`, {}, { headers: this.getHeaders() });
  }

  verifyLicense(licenseNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify/${licenseNumber}`);
  }

  getMyLicenses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-licenses`, { headers: this.getHeaders() });
  }

  getMyLicense(season: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-license?season=${season}`, { headers: this.getHeaders() });
  }

  validateMyLicense(season: string, isValidated: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/my-license/validate?season=${season}&isValidated=${isValidated}`, {}, { headers: this.getHeaders() });
  }

  makeDecision(id: number, approved: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/decision?approved=${approved}`, {}, { headers: this.getHeaders() });
  }
}

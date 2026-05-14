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
    const token = localStorage.getItem('token');
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
}

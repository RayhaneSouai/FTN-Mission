import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParticipationResponseDTO } from '../../competitions/models/competition.model';

@Injectable({ providedIn: 'root' })
export class AdminParticipationApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:8083/ftn/api/admin/participations';

    getPending(): Observable<ParticipationResponseDTO[]> {
        return this.http.get<ParticipationResponseDTO[]>(`${this.baseUrl}/pending`);
    }

    getAll(): Observable<ParticipationResponseDTO[]> {
        return this.http.get<ParticipationResponseDTO[]>(this.baseUrl);
    }

    approve(id: number): Observable<ParticipationResponseDTO> {
        return this.http.put<ParticipationResponseDTO>(`${this.baseUrl}/${id}/approve`, {});
    }

    reject(id: number): Observable<ParticipationResponseDTO> {
        return this.http.put<ParticipationResponseDTO>(`${this.baseUrl}/${id}/reject`, {});
    }
}

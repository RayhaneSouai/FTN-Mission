import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition, CompetitionDetailResponse, ParticipationResponseDTO } from '../models/competition.model';

/**
 * Public API service — read-only competition endpoints + participation.
 */
@Injectable({ providedIn: 'root' })
export class CompetitionApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:8083/ftn/api/competitions';

    getAll(): Observable<Competition[]> {
        return this.http.get<Competition[]>(`${this.baseUrl}/getAll`);
    }

    getById(id: number): Observable<CompetitionDetailResponse> {
        return this.http.get<CompetitionDetailResponse>(`${this.baseUrl}/get/${id}`);
    }

    /** Submit a participation request (swimmer, authenticated) */
    requestParticipation(competitionId: number): Observable<ParticipationResponseDTO> {
        return this.http.post<ParticipationResponseDTO>(
            `${this.baseUrl}/${competitionId}/participate`, {}
        );
    }

    /** Check if the current swimmer already has a participation request */
    getMyParticipation(competitionId: number): Observable<ParticipationResponseDTO | null> {
        return this.http.get<ParticipationResponseDTO | null>(
            `${this.baseUrl}/${competitionId}/my-participation`
        );
    }

    /** Get approved participants for a competition */
    getApprovedParticipants(competitionId: number): Observable<ParticipationResponseDTO[]> {
        return this.http.get<ParticipationResponseDTO[]>(
            `${this.baseUrl}/${competitionId}/participants`
        );
    }
}

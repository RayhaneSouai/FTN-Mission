import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition, CompetitionDetailResponse, CompetitionRequest, DistributionResponse, ParticipationResponseDTO } from '../models/competition.model';

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

    /** Get approved distribution for a competition (public - swimmers) */
    getApprovedDistribution(competitionId: number): Observable<DistributionResponse> {
        return this.http.get<DistributionResponse>(
            `${this.baseUrl}/${competitionId}/distribution`
        );
    }

    /** Get all archived competitions */
    getArchivedCompetitions(): Observable<Competition[]> {
        return this.http.get<Competition[]>(`${this.baseUrl}/archived`);
    }

    /** Archive a competition (admin only) */
    archiveCompetition(id: number): Observable<Competition> {
        return this.http.post<Competition>(
            `http://localhost:8083/ftn/api/admin/competitions/${id}/archive`, {}
        );
    }

    /** Create a competition (admin only) */
    create(dto: CompetitionRequest): Observable<Competition> {
        return this.http.post<Competition>(
            `http://localhost:8083/ftn/api/admin/competitions/add`, dto
        );
    }

    /** Update a competition (admin only) */
    update(id: number, dto: CompetitionRequest): Observable<Competition> {
        return this.http.put<Competition>(
            `http://localhost:8083/ftn/api/admin/competitions/update`, { ...dto, id }
        );
    }
}

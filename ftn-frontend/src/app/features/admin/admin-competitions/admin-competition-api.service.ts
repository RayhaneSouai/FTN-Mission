import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition, CompetitionRequest, DistributionResponse } from '../../competitions/models/competition.model';

/**
 * Admin API service for competition CRUD operations.
 * Points to /api/admin/competitions endpoints (secured).
 */
@Injectable({ providedIn: 'root' })
export class AdminCompetitionApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:8083/ftn/api/admin/competitions';

    getAll(): Observable<Competition[]> {
        return this.http.get<Competition[]>(`${this.baseUrl}/getAll`);
    }

    getById(id: number): Observable<Competition> {
        return this.http.get<Competition>(`${this.baseUrl}/get/${id}`);
    }

    create(dto: CompetitionRequest): Observable<Competition> {
        return this.http.post<Competition>(`${this.baseUrl}/add`, dto);
    }

    update(competition: Competition): Observable<Competition> {
        return this.http.put<Competition>(`${this.baseUrl}/update`, competition);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
    }

    /** Generate participant distribution for a competition */
    generateDistribution(competitionId: number): Observable<DistributionResponse> {
        return this.http.post<DistributionResponse>(
            `${this.baseUrl}/${competitionId}/distribution/generate`, {}
        );
    }

    /** Approve generated distribution */
    approveDistribution(competitionId: number): Observable<DistributionResponse> {
        return this.http.put<DistributionResponse>(
            `${this.baseUrl}/${competitionId}/distribution/approve`, {}
        );
    }

    /** Get current distribution (admin - any status) */
    getDistribution(competitionId: number): Observable<DistributionResponse> {
        return this.http.get<DistributionResponse>(
            `${this.baseUrl}/${competitionId}/distribution`
        );
    }
}

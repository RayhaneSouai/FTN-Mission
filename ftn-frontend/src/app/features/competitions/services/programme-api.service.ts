import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ProgrammeStatusResponse, ProgramItemResponse, ProgramItemRequest
} from '../models/competition.model';

@Injectable({ providedIn: 'root' })
export class ProgrammeApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:8083/ftn/api';

    // ═══════════════════════════════════════════════════════
    // ═══════════ PUBLIC API (read-only, approved) ════════
    // ═══════════════════════════════════════════════════════

    /** Public: get only approved programme */
    getApprovedProgramme(competitionId: number): Observable<ProgrammeStatusResponse> {
        return this.http.get<ProgrammeStatusResponse>(
            `${this.baseUrl}/competitions/${competitionId}/programme`
        );
    }

    /** Public: get participants */
    getParticipants(competitionId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.baseUrl}/competitions/${competitionId}/programme/participants`
        );
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ ADMIN API (full CRUD) ═══════════════════
    // ═══════════════════════════════════════════════════════

    private adminUrl(competitionId: number): string {
        return `${this.baseUrl}/admin/competitions/${competitionId}/programme`;
    }

    getProgrammeStatus(competitionId: number): Observable<ProgrammeStatusResponse> {
        return this.http.get<ProgrammeStatusResponse>(`${this.adminUrl(competitionId)}/status`);
    }

    generateProgramme(competitionId: number): Observable<ProgrammeStatusResponse> {
        return this.http.post<ProgrammeStatusResponse>(`${this.adminUrl(competitionId)}/generate`, {});
    }

    addProgramItem(competitionId: number, dayId: number, request: ProgramItemRequest): Observable<ProgramItemResponse> {
        return this.http.post<ProgramItemResponse>(
            `${this.adminUrl(competitionId)}/days/${dayId}/items`, request
        );
    }

    updateProgramItem(competitionId: number, itemId: number, request: ProgramItemRequest): Observable<ProgramItemResponse> {
        return this.http.put<ProgramItemResponse>(
            `${this.adminUrl(competitionId)}/items/${itemId}`, request
        );
    }

    deleteProgramItem(competitionId: number, itemId: number): Observable<void> {
        return this.http.delete<void>(`${this.adminUrl(competitionId)}/items/${itemId}`);
    }

    getSeriesItems(competitionId: number): Observable<ProgramItemResponse[]> {
        return this.http.get<ProgramItemResponse[]>(`${this.adminUrl(competitionId)}/series`);
    }

    approveProgramme(competitionId: number): Observable<ProgrammeStatusResponse> {
        return this.http.put<ProgrammeStatusResponse>(`${this.adminUrl(competitionId)}/approve`, {});
    }
}

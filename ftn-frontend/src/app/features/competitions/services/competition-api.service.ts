import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition, CompetitionRequest } from '../models/competition.model';

@Injectable({ providedIn: 'root' })
export class CompetitionApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:8083/ftn/api/competitions';

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
}

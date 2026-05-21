import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompetitionResultDTO, RankingEntry } from '../models/performance.model';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8083/ftn/api/rankings';

  getNationalRanking(
    distance: number,
    stroke: string,
    gender: string,
    niveau?: string,
    limit: number = 50
  ): Observable<RankingEntry[]> {
    let params = new HttpParams()
      .set('distance', distance.toString())
      .set('stroke', stroke)
      .set('gender', gender)
      .set('limit', limit.toString());

    if (niveau) params = params.set('niveau', niveau);

    return this.http.get<RankingEntry[]>(`${this.apiUrl}/national`, { params });
  }

  getCompetitionResults(competitionId: number): Observable<CompetitionResultDTO[]> {
    return this.http.get<CompetitionResultDTO[]>(`${this.apiUrl}/competition/${competitionId}`);
  }
}

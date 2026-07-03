import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompetitionResult, RankingEntry } from '../../../core/models/performance.model';
import { apiUrl } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = apiUrl('rankings');

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

    return this.http.get<RankingEntry[]>(`${this.baseUrl}/national`, { params });
  }

  getCompetitionResults(competitionId: number): Observable<CompetitionResult[]> {
    return this.http.get<CompetitionResult[]>(
      `${this.baseUrl}/competition/${competitionId}`
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RankingEntry } from '../models/performance.model';

@Injectable({
  providedIn: 'root'
})
export class RankingService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8083/ftn/api/rankings';

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

    if (niveau) {
      params = params.set('niveau', niveau);
    }

    return this.http.get<RankingEntry[]>(
      `${this.apiUrl}/national`,
      { params }
    );
  }
}

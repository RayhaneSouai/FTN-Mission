import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RankingService } from '../../../../ranking/services/ranking.service';
import { CompetitionResult } from '../../../../../core/models/performance.model';

@Component({
  selector: 'app-resultat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resultat-container">
      <h3>Résultats de la compétition</h3>

      @if (loading()) {
        <div class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p>Chargement des résultats...</p>
        </div>
      } @else if (results().length === 0) {
        <div class="empty-state">
          <p>Aucun résultat disponible pour cette compétition.</p>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Position</th>
                <th>Nageur</th>
                <th>Temps officiel</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (result of results(); track result.swimmerId) {
                <tr [class.disqualified]="result.disqualified">
                  <td>
                    <span class="position-badge" [class]="'pos-' + result.position">
                      {{ result.position }}
                    </span>
                  </td>
                  <td>{{ result.swimmerFirstName }} {{ result.swimmerLastName }}</td>
                  <td>{{ formatTime(result.officialTime) }}</td>
                  <td>
                    @if (result.disqualified) {
                      <span class="badge bg-danger">Disqualifié</span>
                    } @else {
                      <span class="badge bg-success">Classé</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .resultat-container {
      padding: 24px;

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 20px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #6b7280;

      p {
        font-size: 14px;
        margin: 0;
      }
    }

    .table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: #f9fafb;
        padding: 12px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 2px solid #e5e7eb;
      }

      td {
        padding: 12px 16px;
        font-size: 14px;
        color: #1f2937;
        border-bottom: 1px solid #f3f4f6;
      }
    }

    .disqualified td {
      opacity: 0.5;
      text-decoration: line-through;
    }

    .position-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 13px;
      background: #e5e7eb;
      color: #374151;
    }

    .pos-1 {
      background: #fbbf24;
      color: #92400e;
    }

    .pos-2 {
      background: #d1d5db;
      color: #374151;
    }

    .pos-3 {
      background: #f59e0b;
      color: #78350f;
    }

    .badge {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .bg-danger {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .bg-success {
      background-color: #d1fae5;
      color: #065f46;
    }

    .text-center {
      text-align: center;
    }

    .py-4 {
      padding: 32px 0;
    }

    .spinner-border {
      width: 2rem;
      height: 2rem;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultatComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rankingService = inject(RankingService);

  results = signal<CompetitionResult[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const competitionId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (competitionId) {
      this.loadResults(competitionId);
    } else {
      this.loading.set(false);
    }
  }

  private loadResults(competitionId: number): void {
    this.rankingService.getCompetitionResults(competitionId).subscribe({
      next: (data) => {
        this.results.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  formatTime(time: number | null): string {
    if (time == null) return '—';
    if (time >= 60) {
      const min = Math.floor(time / 60);
      const sec = (time % 60).toFixed(2);
      return `${min}:${sec.padStart(5, '0')}`;
    }
    return `${time.toFixed(2)}s`;
  }
}

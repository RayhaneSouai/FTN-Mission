import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankingService } from '../../core/services/ranking.service';
import { RankingEntry, STROKE_LABELS, NIVEAU_LABELS } from '../../core/models/performance.model';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingComponent implements OnInit {
  private readonly rankingService = inject(RankingService);

  readonly strokeLabels = STROKE_LABELS;
  readonly niveauLabels = NIVEAU_LABELS;

  readonly strokes = ['LIBRE', 'DOS', 'BRASSE', 'PAPILLON', 'QUATRE_NAGES'];
  readonly distances = [50, 100, 200, 400, 800, 1500];
  readonly genders = [{ value: 'HOMME', label: 'Homme' }, { value: 'FEMME', label: 'Femme' }];
  readonly niveaux = ['', 'POUSSIN', 'BENJAMIN', 'MINIME', 'CADET', 'JUNIOR', 'SENIOR', 'MASTER'];

  distance = 100;
  stroke = 'LIBRE';
  gender = 'HOMME';
  niveau = '';

  ranking = signal<RankingEntry[]>([]);
  loading = signal(false);
  searched = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking(): void {
    this.loading.set(true);
    this.error.set(null);
    this.rankingService
      .getNationalRanking(this.distance, this.stroke, this.gender, this.niveau || undefined)
      .subscribe({
        next: (data) => {
          this.ranking.set(data);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => {
          this.error.set('Erreur lors du chargement du classement.');
          this.loading.set(false);
          this.searched.set(true);
        },
      });
  }

  formatTime(time: number): string {
    if (time >= 60) {
      const min = Math.floor(time / 60);
      const sec = (time % 60).toFixed(2);
      return `${min}:${sec.padStart(5, '0')}`;
    }
    return `${time.toFixed(2)}s`;
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  }

  get eventLabel(): string {
    return `${this.distance}m ${this.strokeLabels[this.stroke] ?? this.stroke}`;
  }
}

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { RankingService } from '../../core/services/ranking.service';

import {
  RankingEntry
} from '../../core/models/performance.model';

import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {

  private rankingService = inject(RankingService);

  distance = 100;

  stroke = 'LIBRE';

  gender = 'HOMME';

  niveau = 'JUNIOR';

  ranking = signal<RankingEntry[]>([]);

  loading = signal(true);

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking(): void {

    this.loading.set(true);

    this.rankingService
      .getNationalRanking(
        this.distance,
        this.stroke,
        this.gender,
        this.niveau
      )
      .subscribe({

        next: (data) => {
          this.ranking.set(data);
          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);
        }
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
}

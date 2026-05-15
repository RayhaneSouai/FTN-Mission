import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { PerformanceService } from '../../core/services/performance.service';

import {
  PerformanceResponse
} from '../../core/models/performance.model';

import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-my-performances',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './my-performances.component.html',
  styleUrls: ['./my-performances.component.scss']
})
export class MyPerformancesComponent implements OnInit {

  private performanceService = inject(PerformanceService);

  swimmerId = 1;

  performances = signal<PerformanceResponse[]>([]);

  loading = signal(true);

  error = signal<string | null>(null);

  bestPerEvent = computed(() => {

    const map = new Map<string, PerformanceResponse>();

    for (const p of this.performances()) {

      const key = `${p.distance}-${p.stroke}`;

      if (!map.has(key) || p.time < map.get(key)!.time) {
        map.set(key, p);
      }
    }

    return Array.from(map.values());
  });

  ngOnInit(): void {
    this.loadPerformances();
  }

  loadPerformances(): void {

    this.loading.set(true);

    this.performanceService
      .getBySwimmer(this.swimmerId)
      .subscribe({

        next: (data) => {
          this.performances.set(data);
          this.loading.set(false);
        },

        error: () => {
          this.error.set('Erreur lors du chargement');
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

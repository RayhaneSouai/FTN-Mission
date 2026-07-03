import {
  Component, OnInit, OnDestroy, inject, signal, computed,
  ChangeDetectionStrategy, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService } from '../../core/services/performance.service';
import { PerformanceResponse, STROKE_LABELS } from '../../core/models/performance.model';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { PAGE_HERO_IMAGES } from '../../shared/components/page-hero/page-hero.constants';

@Component({
  selector: 'app-my-performances',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeroComponent],
  templateUrl: 'my-performances.component.html',
  styleUrls: ['my-performances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPerformancesComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly heroImage = PAGE_HERO_IMAGES.performances;
  private readonly performanceService = inject(PerformanceService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: any;

  readonly strokeLabels = STROKE_LABELS;

  swimmerId = this.getCurrentUserId();

  performances = signal<PerformanceResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedEvent = signal<string | null>(null);

  readonly events = computed(() => {
    const keys = new Set<string>();
    for (const p of this.performances()) {
      keys.add(`${p.distance}-${p.stroke}`);
    }
    return Array.from(keys).map(k => {
      const [dist, stroke] = k.split('-');
      return { key: k, label: `${dist}m ${this.strokeLabels[stroke] ?? stroke}` };
    });
  });

  readonly bestPerEvent = computed(() => {
    const map = new Map<string, PerformanceResponse>();
    for (const p of this.performances()) {
      const key = `${p.distance}-${p.stroke}`;
      if (!map.has(key) || p.time < map.get(key)!.time) map.set(key, p);
    }
    return Array.from(map.values()).sort((a, b) => a.distance - b.distance);
  });

  readonly chartData = computed(() => {
    const key = this.selectedEvent();
    if (!key) return [];
    return this.performances()
      .filter(p => `${p.distance}-${p.stroke}` === key)
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly stats = computed(() => {
    const perfs = this.performances();
    return {
      total: perfs.length,
      pr: perfs.filter(p => p.personalRecord).length,
      nr: perfs.filter(p => p.nationalRecord).length,
      events: this.events().length,
    };
  });

  ngOnInit(): void {
    if (!this.swimmerId) {
      this.error.set('Utilisateur connecté introuvable.');
      this.loading.set(false);
      return;
    }

    this.performanceService.getBySwimmer(this.swimmerId).subscribe({
      next: (data) => {
        this.performances.set(data);
        this.loading.set(false);
        if (this.events().length > 0) {
          this.selectedEvent.set(this.events()[0].key);
        }
      },
      error: () => {
        this.error.set('Erreur lors du chargement de vos performances.');
        this.loading.set(false);
      },
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChartLib();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

  selectEvent(key: string): void {
    this.selectedEvent.set(key);
    setTimeout(() => this.renderChart(), 50);
  }

  private async loadChartLib(): Promise<void> {
    if (typeof (window as any).Chart !== 'undefined') {
      this.renderChart();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
    script.onload = () => this.renderChart();
    document.head.appendChild(script);
  }

  renderChart(): void {
    if (!this.chartCanvas || typeof (window as any).Chart === 'undefined') return;
    const data = this.chartData();
    if (data.length === 0) return;

    if (this.chart) this.chart.destroy();

    const Chart = (window as any).Chart;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const labels = data.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
    const times = data.map(p => p.time);
    const minTime = Math.min(...times);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temps (s)',
          data: times,
          borderColor: '#1565C0',
          backgroundColor: 'rgba(21,101,192,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: times.map(t => t === minTime ? '#1565C0' : '#90CAF9'),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.3,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${this.formatTime(ctx.raw)}`,
            },
          },
        },
        scales: {
          y: {
            reverse: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              callback: (val: number) => this.formatTime(val),
              font: { size: 11 },
            },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
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

  getEventLabel(key: string): string {
    const [dist, stroke] = key.split('-');
    return `${dist}m ${this.strokeLabels[stroke] ?? stroke}`;
  }

  private getCurrentUserId(): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;
      const user = JSON.parse(stored);
      return user.id || user.idUser || user.id_user || null;
    } catch {
      return null;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';

@Component({
  selector: 'app-swimmer-performances',
  templateUrl: './swimmer-performances.component.html',
  styleUrls: ['./swimmer-performances.component.css']
})
export class SwimmerPerformancesComponent implements OnInit {
  progress: any = null;
  loading = true;
  strokeFilter = 'all';
  strokeTypes = ['all', 'FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'MEDLEY'];

  constructor(private svc: SwimmerService) {}

  ngOnInit() {
    this.svc.getProgress().subscribe({
      next: (p) => { this.progress = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filteredPerfs(): any[] {
    const all = this.progress?.performances || [];
    if (this.strokeFilter === 'all') return all;
    return all.filter((p: any) => p.stroke === this.strokeFilter);
  }

  formatTime(t: number): string {
    if (!t) return '—';
    const m = Math.floor(t / 60);
    const s = (t % 60).toFixed(2).padStart(5, '0');
    return m > 0 ? `${m}:${s}` : `${s}s`;
  }
}

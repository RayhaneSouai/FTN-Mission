import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';

@Component({
  selector: 'app-swimmer-dashboard',
  templateUrl: './swimmer-dashboard.component.html',
  styleUrls: ['./swimmer-dashboard.component.css']
})
export class SwimmerDashboardComponent implements OnInit {
  user: any = {};
  profile: any = null;
  progress: any = null;
  competitions: any[] = [];
  news: any[] = [];
  loading = true;
  error = false;

  constructor(private swimmerService: SwimmerService) {}

  ngOnInit() {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    if (stored) this.user = JSON.parse(stored);
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.swimmerService.getProfile().subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: () => { this.loading = false; this.error = true; }
    });

    this.swimmerService.getCompetitions().subscribe({
      next: (c) => { this.competitions = (c || []).slice(0, 3); },
      error: () => {}
    });

    this.swimmerService.getNews().subscribe({
      next: (n) => {
        this.news = (n || []).filter((i: any) => i.status === 'PUBLISHED').slice(0, 3);
      },
      error: () => {}
    });

    this.swimmerService.getProgress().subscribe({
      next: (pr) => { this.progress = pr; },
      error: () => {}
    });
  }

  get displayName(): string {
    if (this.profile) return `${this.profile.firstName} ${this.profile.lastName}`;
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  openLink(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }
}

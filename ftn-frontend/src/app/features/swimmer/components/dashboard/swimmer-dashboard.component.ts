import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';

import { PressService } from '../../../press/services/press.service';

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

  constructor(
    private swimmerService: SwimmerService,
    public pressService: PressService
  ) {}

  ngOnInit() {
    const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null;
    if (stored) this.user = JSON.parse(stored);
    this.loadData();
  }

  dashboardStats: any = null;

  loadData() {
    this.loading = true;
    
    // Fallback: If getProfile doesn't exist on athlete/profile, we'll use user from sessionStorage
    this.profile = this.user; 

    // We fetch the new dashboard stats API
    if (this.user && this.user.id) {
      this.swimmerService.getDashboardStats(this.user.id).subscribe({
        next: (stats) => { this.dashboardStats = stats; this.loading = false; },
        error: () => { this.loading = false; this.error = true; }
      });
    } else {
      this.loading = false;
    }

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
  }

  get displayName(): string {
    if (this.profile) return `${this.profile.firstName} ${this.profile.lastName}`;
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  openLink(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }
}

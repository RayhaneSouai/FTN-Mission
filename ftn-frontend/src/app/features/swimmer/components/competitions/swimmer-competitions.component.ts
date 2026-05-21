import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';

@Component({
  selector: 'app-swimmer-competitions',
  templateUrl: './swimmer-competitions.component.html',
  styleUrls: ['./swimmer-competitions.component.css']
})
export class SwimmerCompetitionsComponent implements OnInit {
  competitions: any[] = [];
  loading = true;
  filter = 'all';

  constructor(private svc: SwimmerService) {}

  ngOnInit() {
    this.svc.getCompetitions().subscribe({
      next: (c) => { this.competitions = c || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): any[] {
    if (this.filter === 'all') return this.competitions;
    return this.competitions.filter(c => c.status === this.filter.toUpperCase());
  }
}

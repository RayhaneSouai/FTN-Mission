import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';

@Component({
  selector: 'app-swimmer-actualites',
  templateUrl: './swimmer-actualites.component.html',
  styleUrls: ['./swimmer-actualites.component.css']
})
export class SwimmerActualitesComponent implements OnInit {
  news: any[] = [];
  loading = true;

  constructor(private svc: SwimmerService) {}

  ngOnInit() {
    this.svc.getNews().subscribe({
      next: (n) => {
        this.news = (n || []).filter((i: any) => i.status === 'PUBLISHED');
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openLink(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }
}

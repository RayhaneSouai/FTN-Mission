import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';
import { PressService } from '../../../press/services/press.service';

@Component({
  selector: 'app-swimmer-actualites',
  templateUrl: './swimmer-actualites.component.html',
  styleUrls: ['./swimmer-actualites.component.css']
})
export class SwimmerActualitesComponent implements OnInit {
  news: any[] = [];
  loading = true;
  selectedDiscipline = '';
  disciplines: string[] = ['Natation', 'Water-Polo', 'Plongeon', 'Natation Artistique', 'Eau Libre'];

  get filteredItems(): any[] {
    if (!this.selectedDiscipline) return this.news;
    return this.news.filter(i => i.discipline === this.selectedDiscipline);
  }

  constructor(private svc: SwimmerService, public pressService: PressService) {}

  ngOnInit() {
    this.svc.getNews().subscribe({
      next: (n) => {
        this.news = (n || []).filter((i: any) => i.status === 'PUBLISHED');
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterByDiscipline(disc: string) {
    this.selectedDiscipline = disc;
  }

  openLink(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }
}

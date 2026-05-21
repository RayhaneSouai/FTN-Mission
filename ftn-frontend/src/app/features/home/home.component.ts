import { Component, OnInit } from '@angular/core';
import { PressItem } from '../press/models/press-item.model';
import { PressService } from '../press/services/press.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  cards = [
    { title: 'Compétitions', description: 'Calendrier et résultats', icon: 'trophy', color: '#1565C0' },
    { title: 'Équipes Nationales', description: 'Natation et Water Polo', icon: 'users', color: '#1565C0' },
    { title: 'Stages', description: 'Formations et stages', icon: 'calendar', color: '#1565C0' },
    { title: 'Règlements', description: 'Documents officiels', icon: 'book', color: '#1565C0' }
  ];

  news: PressItem[] = [];
  loading = false;

  constructor(public pressService: PressService) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        // Filtrer les articles publiés et prendre les 3 dernières actualités pour l'accueil
        this.news = data
          .filter(item => item.status === 'PUBLISHED')
          .sort((a, b) => (b.idPressItem || 0) - (a.idPressItem || 0))
          .slice(0, 3);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank');
  }
}

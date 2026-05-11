import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  cards = [
    { title: 'Compétitions', description: 'Calendrier et résultats', icon: 'trophy', color: '#1565C0' },
    { title: 'Équipes Nationales', description: 'Natation et Water Polo', icon: 'users', color: '#1565C0' },
    { title: 'Stages', description: 'Formations et stages', icon: 'calendar', color: '#1565C0' },
    { title: 'Règlements', description: 'Documents officiels', icon: 'book', color: '#1565C0' }
  ];
}

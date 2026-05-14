import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = [
    { label: 'Utilisateurs Totaux', value: '1,284', icon: 'users', color: 'blue', trend: '+12%' },
    { label: 'Licences Actives', value: '856', icon: 'license', color: 'azure', trend: '+5%' },
    { label: 'Demandes en Attente', value: '23', icon: 'pending', color: 'orange', trend: '-2' },
    { label: 'Clubs Affiliés', value: '42', icon: 'club', color: 'indigo', trend: 'Stable' }
  ];

  recentActivities = [
    { type: 'user', title: 'Nouvel utilisateur', description: 'Amine Ben Salem s\'est inscrit comme Nageur.', time: 'il y a 5 min' },
    { type: 'license', title: 'Licence validée', description: 'La licence #L-2026-001 a été approuvée.', time: 'il y a 20 min' },
    { type: 'system', title: 'Mise à jour système', description: 'La plateforme est passée en version 2.1.0.', time: 'il y a 2h' }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}

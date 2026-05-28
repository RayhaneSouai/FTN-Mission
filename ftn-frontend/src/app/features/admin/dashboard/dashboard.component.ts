import { Component, OnInit } from '@angular/core';
import { UserService } from '../../users/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any[] = [];
  loadingStats = true;

  recentActivities = [
    { type: 'user', title: 'Nouvel utilisateur', description: 'Amine Ben Salem s\'est inscrit comme Nageur.', time: 'il y a 5 min' },
    { type: 'license', title: 'Licence validée', description: 'La licence #L-2026-001 a été approuvée.', time: 'il y a 20 min' },
    { type: 'system', title: 'Mise à jour système', description: 'La plateforme est passée en version 2.1.0.', time: 'il y a 2h' }
  ];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.loadingStats = true;
    this.userService.getAdminDashboardStats().subscribe({
      next: (data) => {
        this.stats = [
          { label: 'Utilisateurs Totaux', value: data.totalUsers.toString(), icon: 'users', color: 'blue', trend: '+0%' },
          { label: 'Licences Actives', value: data.activeLicenses.toString(), icon: 'license', color: 'azure', trend: '+0%' },
          { label: 'Demandes en Attente', value: data.pendingRequests.toString(), icon: 'pending', color: 'orange', trend: '+0' },
          { label: 'Clubs Affiliés', value: data.affiliatedClubs.toString(), icon: 'club', color: 'indigo', trend: 'Stable' }
        ];
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
        // fallback to default if error
        this.stats = [
          { label: 'Utilisateurs Totaux', value: '...', icon: 'users', color: 'blue', trend: '' },
          { label: 'Licences Actives', value: '...', icon: 'license', color: 'azure', trend: '' },
          { label: 'Demandes en Attente', value: '...', icon: 'pending', color: 'orange', trend: '' },
          { label: 'Clubs Affiliés', value: '...', icon: 'club', color: 'indigo', trend: '' }
        ];
      }
    });
  }
}

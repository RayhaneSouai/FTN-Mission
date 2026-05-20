import { Component, OnInit } from '@angular/core';
import { UserService } from '../../users/services/user.service';
import { LicenseService } from '../../licenses/services/license.service';
import { ClubService } from '../../clubs/services/club.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = [
    { label: 'Utilisateurs Totaux', value: '...', icon: 'users', color: 'blue', detail: 'Membres enregistrés' },
    { label: 'Licences Actives', value: '...', icon: 'license', color: 'azure', detail: 'Validées cette saison' },
    { label: 'Demandes en Attente', value: '...', icon: 'pending', color: 'orange', detail: 'À traiter rapidement' },
    { label: 'Clubs Affiliés', value: '...', icon: 'club', color: 'indigo', detail: 'Réseau partenaire FTN' }
  ];

  recentActivities: any[] = [];
  chartData: any[] = [];

  constructor(
    private userService: UserService,
    private licenseService: LicenseService,
    private clubService: ClubService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.recentActivities = []; // clear activities before loading

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.stats[0].value = users.length.toString();
        const pending = users.filter((u: any) => u.registrationStatus === 'EN_ATTENTE').length;
        this.stats[2].value = pending.toString();

        // Mettre à jour le graphique
        this.generateChartData(users);

        // Activités: 2 derniers utilisateurs inscrits
        const sortedUsers = [...users].sort((a: any, b: any) => b.id - a.id);
        sortedUsers.slice(0, 2).forEach(u => {
          const roleStr = u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : 'Utilisateur';
          this.recentActivities.push({
            type: 'user',
            title: u.registrationStatus === 'EN_ATTENTE' ? 'Nouvelle demande' : 'Nouvel utilisateur',
            description: `${u.firstName} ${u.lastName} s'est inscrit(e) comme ${roleStr}.`,
            time: u.createdAt ? this.getRelativeTime(u.createdAt) : 'Récemment'
          });
        });
      },
      error: (err) => console.error('Erreur chargement utilisateurs', err)
    });

    this.licenseService.getAllLicenses().subscribe({
      next: (licenses) => {
        this.stats[1].value = licenses.length.toString();

        // Activités: dernière licence
        const sortedLicenses = [...licenses].sort((a: any, b: any) => b.id - a.id);
        if (sortedLicenses.length > 0) {
          const l = sortedLicenses[0];
          this.recentActivities.push({
            type: 'license',
            title: 'Nouvelle licence',
            description: `La licence ${l.licenseNumber} a été enregistrée.`,
            time: l.issueDate ? this.getRelativeTime(l.issueDate) : 'Récemment'
          });
        }
      },
      error: (err) => console.error('Erreur chargement licences', err)
    });

    this.clubService.getAll().subscribe({
      next: (clubs) => {
        this.stats[3].value = clubs.length.toString();
      },
      error: (err) => console.error('Erreur chargement clubs', err)
    });
  }

  getRelativeTime(dateString: any): string {
    if (!dateString) return 'Récemment';
    
    let date: Date;
    if (Array.isArray(dateString)) {
      // Format [year, month, day, hour, minute]
      date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3] || 0, dateString[4] || 0);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return 'Récemment';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays === 1) return 'hier';
    return `il y a ${diffDays} jours`;
  }

  generateChartData(users: any[]): void {
    this.chartData = [];
    const daysStr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Structure pour stocker les rôles par jour
    // rolesByDay[diffDays] = { SWIMMER: count, COACH: count, ... }
    const rolesByDay: any[] = Array.from({ length: 7 }, () => ({
      SWIMMER: 0, COACH: 0, ADMIN: 0, VISITOR: 0, total: 0
    }));

    const labels = new Array(7).fill('');

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels[6 - i] = daysStr[d.getDay()];
    }

    users.forEach(u => {
      const rawDate = u.createdAt || u.created_at;
      if (rawDate) {
        let created: Date;
        if (Array.isArray(rawDate)) {
          created = new Date(rawDate[0], rawDate[1] - 1, rawDate[2]);
        } else if (typeof rawDate === 'string') {
          created = new Date(rawDate.replace(' ', 'T'));
        } else {
          created = new Date(rawDate);
        }

        if (!isNaN(created.getTime())) {
          const createdMidnight = new Date(created.getFullYear(), created.getMonth(), created.getDate());
          const diffMs = todayMidnight.getTime() - createdMidnight.getTime();
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7) {
            const dayIndex = 6 - diffDays;
            const role = u.role || 'VISITOR';
            if (rolesByDay[dayIndex][role] !== undefined) {
              rolesByDay[dayIndex][role]++;
              rolesByDay[dayIndex].total++;
            }
          }
        }
      }
    });

    const maxTotal = Math.max(...rolesByDay.map(d => d.total), 1);

    for (let i = 0; i < 7; i++) {
      const d = rolesByDay[i];
      // Couleurs pro pour chaque rôle
      const roleSegments = [
        { role: 'Swimmer', count: d.SWIMMER, color: '#3b82f6', height: (d.SWIMMER / maxTotal) * 100 },
        { role: 'Coach', count: d.COACH, color: '#10b981', height: (d.COACH / maxTotal) * 100 },
        { role: 'Admin', count: d.ADMIN, color: '#f59e0b', height: (d.ADMIN / maxTotal) * 100 },
        { role: 'Visitor', count: d.VISITOR, color: '#94a3b8', height: (d.VISITOR / maxTotal) * 100 }
      ].filter(s => s.count > 0);

      this.chartData.push({
        label: labels[i],
        total: d.total,
        percentage: (d.total / maxTotal) * 100,
        active: i === 6,
        roles: roleSegments
      });
    }
  }
}

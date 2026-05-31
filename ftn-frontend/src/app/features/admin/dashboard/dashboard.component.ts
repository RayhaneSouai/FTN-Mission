import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../../users/services/user.service';
import { LicenseService } from '../../licenses/services/license.service';
import { ClubService } from '../../clubs/services/club.service';
import { DashboardActivityComponent } from '../../../dashboard/dashboard-activity/dashboard-activity.component';
import { AdminStatVariant } from '../../../shared/admin-ui/components/admin-stat-card/admin-stat-card.component';
import { ToastService } from '../../competitions/services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('activityChart') activityChart?: DashboardActivityComponent;

  refreshing = false;
  statsLoading = true;
  pendingCount = 0;
  adminFirstName = '';

  stats: { label: string; value: string; icon: string; color: AdminStatVariant; detail: string }[] = [
    { label: 'Utilisateurs totaux',  value: '—', icon: 'users',   color: 'blue',   detail: 'Membres enregistrés' },
    { label: 'Licences actives',     value: '—', icon: 'license', color: 'azure',  detail: 'Validées cette saison' },
    { label: 'Demandes en attente',  value: '—', icon: 'pending', color: 'orange', detail: 'À traiter rapidement' },
    { label: 'Clubs affiliés',       value: '—', icon: 'club',    color: 'indigo', detail: 'Réseau partenaire FTN' }
  ];

  recentActivities: { type: string; title: string; description: string; time: string; sortKey: number }[] = [];

  constructor(
    private userService: UserService,
    private licenseService: LicenseService,
    private clubService: ClubService,
    private toast: ToastService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        this.adminFirstName = u.firstName ?? '';
      }
    }
    this.loadStats();
  }

  statIcon(key: string): string {
    const map: Record<string, string> = {
      users:   'bi-people-fill',
      license: 'bi-card-checklist',
      pending: 'bi-hourglass-split',
      club:    'bi-building'
    };
    return map[key] ?? 'bi-graph-up';
  }

  onStatNavigate(index: number): void {
    if (index === 0 || index === 2) {
      this.router.navigate(['/admin/utilisateurs']);
      return;
    }
    if (index === 1) {
      this.router.navigate(['/admin/licences']);
    }
  }

  refresh(): void {
    this.refreshing = true;
    this.loadStats();
    this.activityChart?.reload();
    setTimeout(() => (this.refreshing = false), 600);
  }

  loadStats(): void {
    this.statsLoading = true;
    this.recentActivities = [];

    forkJoin({
      users:    this.userService.getAllUsers().pipe(catchError(() => of([]))),
      licenses: this.licenseService.getAllLicenses().pipe(catchError(() => of([]))),
      clubs:    this.clubService.getAll().pipe(catchError(() => of([])))
    }).subscribe(({ users, licenses, clubs }) => {
      this.stats[0].value = users.length.toString();

      this.pendingCount = users.filter(
        (u: { registrationStatus?: string }) => u.registrationStatus === 'EN_ATTENTE'
      ).length;
      this.stats[2].value  = this.pendingCount.toString();
      this.stats[2].detail = this.pendingCount > 0
        ? `${this.pendingCount} demande(s) à examiner`
        : 'Aucune demande en attente';

      this.stats[1].value = licenses.length.toString();
      this.stats[3].value = clubs.length.toString();

      const activities: typeof this.recentActivities = [];

      const sortedUsers = [...users].sort((a: { id: number }, b: { id: number }) => b.id - a.id);
      sortedUsers.slice(0, 3).forEach((u: Record<string, unknown>) => {
        const roleStr = u['role']
          ? String(u['role']).charAt(0).toUpperCase() + String(u['role']).slice(1).toLowerCase()
          : 'Utilisateur';
        const created = u['createdAt'];
        activities.push({
          type:        'user',
          title:       u['registrationStatus'] === 'EN_ATTENTE' ? 'Nouvelle demande' : 'Nouvel utilisateur',
          description: `${u['firstName']} ${u['lastName']} — ${roleStr}`,
          time:        created ? this.getRelativeTime(created) : 'Récemment',
          sortKey:     this.toTimestamp(created)
        });
      });

      const sortedLicenses = [...licenses].sort((a: { id: number }, b: { id: number }) => b.id - a.id);
      if (sortedLicenses.length > 0) {
        const l = sortedLicenses[0] as Record<string, unknown>;
        const issueDate = l['issueDate'];
        activities.push({
          type:        'license',
          title:       'Nouvelle licence',
          description: `Licence ${l['licenseNumber']} enregistrée`,
          time:        issueDate ? this.getRelativeTime(issueDate) : 'Récemment',
          sortKey:     this.toTimestamp(issueDate)
        });
      }

      this.recentActivities = activities.sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
      this.statsLoading = false;
    });
  }

  private toTimestamp(dateInput: unknown): number {
    if (!dateInput) return 0;
    if (Array.isArray(dateInput)) {
      const d = dateInput as number[];
      return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0).getTime();
    }
    return new Date(dateInput as string).getTime() || 0;
  }

  getRelativeTime(dateString: unknown): string {
    if (!dateString) return 'Récemment';

    let date: Date;
    if (Array.isArray(dateString)) {
      date = new Date(
        (dateString as number[])[0],
        (dateString as number[])[1] - 1,
        (dateString as number[])[2],
        (dateString as number[])[3] || 0,
        (dateString as number[])[4] || 0
      );
    } else {
      date = new Date(dateString as string);
    }

    if (isNaN(date.getTime())) return 'Récemment';

    const diffMs   = Date.now() - date.getTime();
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays  = Math.floor(diffHours / 24);

    if (diffMins  <  1) return "à l'instant";
    if (diffMins  < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays  === 1) return 'hier';
    return `il y a ${diffDays} jours`;
  }
}
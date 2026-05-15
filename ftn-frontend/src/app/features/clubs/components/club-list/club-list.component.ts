import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ClubService } from '../../services/club.service';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-club-list',
  templateUrl: './club-list.component.html',
  styleUrl: './club-list.component.css'
})
export class ClubListComponent implements OnInit {
  clubs: Club[] = [];
  topClubs: Club[] = [];
  filteredClubs: Club[] = [];
  searchTerm = '';
  loading = true;
  showForm = false;
  showStats = false;
  selectedClub: Club | null = null;
  editingClub: Club | null = null;
  statistics: any = null;
  /** True when a JWT is present — required for POST/PUT/DELETE on /api/clubs */
  canManage = false;

  formData: Club = {
    name: '',
    region: '',
    address: '',
    contact: '',
    manager: '',
    affiliationDate: '',
    latitude: undefined,
    longitude: undefined
  };

  constructor(
    private clubService: ClubService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.refreshAuthState();
    this.loadClubs();
    this.loadTopClubs();
  }

  private refreshAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.canManage = !!localStorage.getItem('token');
    }
  }

  /** Backend rejects writes without JWT (403). Redirect to login when needed. */
  private requireAuth(): boolean {
    this.refreshAuthState();
    if (this.canManage) {
      return true;
    }
    alert('Connectez-vous pour gérer les clubs.');
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/clubs' } });
    return false;
  }

  private handleWriteError(err: any, action: string): void {
    if (err?.status === 403 || err?.status === 401) {
      alert('Session expirée ou accès refusé. Veuillez vous reconnecter.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/clubs' } });
      return;
    }
    console.error(`Erreur ${action}:`, err);
    alert(`Erreur lors de ${action}. Vérifiez la console.`);
  }

  loadClubs(): void {
    this.loading = true;
    this.clubService.getAll().subscribe({
      next: (data) => {
        this.clubs = data;
        this.filteredClubs = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement clubs:', err);
        this.loading = false;
      }
    });
  }

  loadTopClubs(): void {
    this.clubService.getTopClubs().subscribe({
      next: (data) => this.topClubs = data,
      error: (err: any) => console.error('Erreur top clubs:', err)
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredClubs = this.clubs;
      return;
    }
    this.filteredClubs = this.clubs.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.region.toLowerCase().includes(term) ||
      c.manager.toLowerCase().includes(term)
    );
  }

  openAddForm(): void {
    if (!this.requireAuth()) return;
    this.editingClub = null;
    this.formData = { name: '', region: '', address: '', contact: '', manager: '', affiliationDate: '' };
    this.showForm = true;
  }

  openEditForm(club: Club): void {
    if (!this.requireAuth()) return;
    this.editingClub = club;
    this.formData = { ...club };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingClub = null;
  }

  saveClub(): void {
    if (!this.requireAuth()) return;
    if (this.editingClub && this.editingClub.id) {
      this.clubService.update(this.editingClub.id, this.formData).subscribe({
        next: () => {
          alert('Club modifié avec succès !');
          this.loadClubs();
          this.closeForm();
        },
        error: (err: any) => this.handleWriteError(err, 'la modification')
      });
    } else {
      this.clubService.create(this.formData).subscribe({
        next: () => {
          alert('Club ajouté avec succès !');
          this.loadClubs();
          this.closeForm();
        },
        error: (err: any) => this.handleWriteError(err, 'l\'ajout')
      });
    }
  }

  deleteClub(id: number): void {
    if (!this.requireAuth()) return;
    if (confirm('Voulez-vous vraiment supprimer ce club ?')) {
      this.clubService.delete(id).subscribe({
        next: () => {
          this.loadClubs();
          this.loadTopClubs();
        },
        error: (err: any) => this.handleWriteError(err, 'la suppression')
      });
    }
  }

  openStats(club: Club): void {
    this.selectedClub = club;
    this.showStats = true;
    this.statistics = null;
    if (club.id) {
      this.clubService.getStatistics(club.id).subscribe({
        next: (stats: any) => this.statistics = stats,
        error: (err: any) => console.error('Erreur stats:', err)
      });
    }
  }

  closeStats(): void {
    this.showStats = false;
    this.selectedClub = null;
    this.statistics = null;
  }

  getBarWidth(value: any): number {
    if (!this.statistics || !this.statistics.totalSwimmers || this.statistics.totalSwimmers === 0) {
      return 0;
    }
    return (value / this.statistics.totalSwimmers) * 100;
  }
}

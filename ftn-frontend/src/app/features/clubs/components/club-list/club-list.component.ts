import { Component, OnInit } from '@angular/core';
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

  constructor(private clubService: ClubService) {}

  ngOnInit(): void {
    this.loadClubs();
    this.loadTopClubs();
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
    this.editingClub = null;
    this.formData = { name: '', region: '', address: '', contact: '', manager: '', affiliationDate: '' };
    this.showForm = true;
  }

  openEditForm(club: Club): void {
    this.editingClub = club;
    this.formData = { ...club };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingClub = null;
  }

  saveClub(): void {
    console.log('Enregistrement du club:', this.formData);
    if (this.editingClub && this.editingClub.id) {
      this.clubService.update(this.editingClub.id, this.formData).subscribe({
        next: () => {
          alert('Club modifié avec succès !');
          this.loadClubs();
          this.closeForm();
        },
        error: (err: any) => {
          console.error('Erreur modification:', err);
          alert('Erreur lors de la modification. Vérifiez la console.');
        }
      });
    } else {
      this.clubService.create(this.formData).subscribe({
        next: () => {
          alert('Club ajouté avec succès !');
          this.loadClubs();
          this.closeForm();
        },
        error: (err: any) => {
          console.error('Erreur création:', err);
          alert('Erreur lors de l\'ajout. Vérifiez la console.');
        }
      });
    }
  }

  deleteClub(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce club ?')) {
      this.clubService.delete(id).subscribe({
        next: () => {
          this.loadClubs();
          this.loadTopClubs();
        },
        error: (err: any) => console.error('Erreur suppression:', err)
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

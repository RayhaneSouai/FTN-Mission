import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LicenseService } from '../services/license.service';
import { ClubService } from '../../clubs/services/club.service';
import { UserService } from '../../users/services/user.service';

@Component({
  selector: 'app-license-form',
  templateUrl: './license-form.component.html',
  styleUrls: ['../../users/user-form/user-form.component.css']
})
export class LicenseFormComponent implements OnInit, OnChanges {
  @Input() licenseId: number | null = null;
  @Input() viewOnly: boolean = false;
  @Output() formSaved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = false;
  loading = false;
  
  licenseData: any = {
    licenseNumber: '',
    season: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
    issueDate: new Date().toISOString().substring(0, 10),
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().substring(0, 10),
    club: { id: null },
    swimmer: { id: null }
  };
  
  clubs: any[] = [];
  swimmers: any[] = [];
  filteredSwimmers: any[] = [];
  
  error = '';
  success = '';

  constructor(
    private licenseService: LicenseService,
    private clubService: ClubService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadClubs();
    this.loadSwimmers();
    if (this.licenseId) {
      this.initForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['licenseId']) {
      this.initForm();
    }
  }

  initForm() {
    this.error = '';
    this.success = '';
    if (this.licenseId) {
      this.isEditMode = true;
      this.loadLicense(this.licenseId);
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  resetForm() {
    this.licenseData = {
      licenseNumber: '',
      season: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
      issueDate: new Date().toISOString().substring(0, 10),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().substring(0, 10),
      club: { id: null },
      swimmer: { id: null }
    };
    this.filteredSwimmers = [];
  }

  loadSwimmers() {
    this.userService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.swimmers = data.filter(u => u.role === 'SWIMMER');
        this.filterSwimmersByClub();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des nageurs', err);
      }
    });
  }

  filterSwimmersByClub() {
    const clubId = this.licenseData.club?.id;
    if (clubId) {
      this.filteredSwimmers = this.swimmers.filter(s => s.clubId === clubId);
    } else {
      // Independent swimmers can also have a license (clubId == null)
      this.filteredSwimmers = this.swimmers.filter(s => !s.clubId);
    }
  }

  loadLicense(id: number) {
    this.loading = true;
    this.licenseService.getLicenseById(id).subscribe({
      next: (data) => {
        this.licenseData = data;
        if (!this.licenseData.club) {
          this.licenseData.club = { id: null };
        }
        if (!this.licenseData.swimmer) {
          this.licenseData.swimmer = { id: null };
        }
        if (this.licenseData.issueDate) {
          this.licenseData.issueDate = new Date(this.licenseData.issueDate).toISOString().substring(0, 10);
        }
        if (this.licenseData.expiryDate) {
          this.licenseData.expiryDate = new Date(this.licenseData.expiryDate).toISOString().substring(0, 10);
        }
        this.filterSwimmersByClub();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la licence';
        this.loading = false;
        console.error(err);
      }
    });
  }

  saveLicense() {
    if (this.viewOnly) return;
    
    this.loading = true;
    this.error = '';
    
    const clubId = this.licenseData.club?.id;
    const swimmerId = this.licenseData.swimmer?.id;

    if (!this.licenseData.season?.trim() || !this.licenseData.issueDate || !this.licenseData.expiryDate) {
      this.error = 'La saison, la date d\'émission et la date d\'expiration sont obligatoires.';
      this.loading = false;
      return;
    }

    if (this.isEditMode) {
      if (!swimmerId) {
        this.error = 'Le nageur est obligatoire pour la mise à jour.';
        this.loading = false;
        return;
      }
    } else if (!clubId && !swimmerId) {
      this.error = 'Sélectionnez un club ou un nageur.';
      this.loading = false;
      return;
    }

    if (swimmerId && !clubId) {
      const selectedSwimmer = this.swimmers.find(s => s.id === swimmerId);
      if (selectedSwimmer) {
        this.licenseData.club = { id: selectedSwimmer.clubId || null };
      }
    } else if (clubId && !swimmerId) {
      this.licenseData.swimmer = { id: null };
    }
    
    if (this.isEditMode && this.licenseId) {
      this.licenseService.updateLicense(this.licenseId, this.licenseData).subscribe({
        next: () => {
          this.success = 'Licence mise à jour avec succès.';
          this.loading = false;
          setTimeout(() => this.formSaved.emit(), 1000);
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.licenseService.createLicense(this.licenseData).subscribe({
        next: (result) => {
          const count = Array.isArray(result) ? result.length : 1;
          this.success = count > 1
            ? `${count} licences créées avec succès pour le club.`
            : 'Licence créée avec succès.';
          this.loading = false;
          setTimeout(() => this.formSaved.emit(), 1000);
        },
        error: (err) => {
          this.error = 'Erreur lors de la création.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  loadClubs() {
    this.clubService.getAll().subscribe({
      next: (data: any) => {
        this.clubs = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des clubs', err);
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}

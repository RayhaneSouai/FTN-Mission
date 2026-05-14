import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LicenseService } from '../services/license.service';
import { ClubService } from '../../clubs/services/club.service';

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
    clubId: null
  };
  
  clubs: any[] = [];
  
  error = '';
  success = '';

  constructor(
    private licenseService: LicenseService,
    private clubService: ClubService
  ) { }

  ngOnInit(): void {
    this.loadClubs();
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
      clubId: null
    };
  }

  loadLicense(id: number) {
    this.loading = true;
    this.licenseService.getLicenseById(id).subscribe({
      next: (data) => {
        this.licenseData = data;
        if (this.licenseData.issueDate) {
          this.licenseData.issueDate = new Date(this.licenseData.issueDate).toISOString().substring(0, 10);
        }
        if (this.licenseData.expiryDate) {
          this.licenseData.expiryDate = new Date(this.licenseData.expiryDate).toISOString().substring(0, 10);
        }
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
    
    if (!this.licenseData.season?.trim() || 
        !this.licenseData.clubId || 
        !this.licenseData.issueDate || 
        !this.licenseData.expiryDate) {
      this.error = 'Tous les champs sont obligatoires.';
      this.loading = false;
      return;
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
        next: () => {
          this.success = 'Licence créée avec succès.';
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

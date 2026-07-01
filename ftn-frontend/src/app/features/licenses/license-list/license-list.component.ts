import { Component, OnInit } from '@angular/core';
import { LicenseService } from '../services/license.service';
import { ClubService } from '../../clubs/services/club.service';

declare var bootstrap: any;

@Component({
  selector: 'app-license-list',
  templateUrl: './license-list.component.html',
  styleUrls: ['./license-list.component.css']
})
export class LicenseListComponent implements OnInit {
  licenses: any[] = [];
  loading = true;
  error = '';
  success = '';
  season = new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString();
  selectedLicenseId: number | null = null;
  viewOnly: boolean = false;
  modalTitle: string = 'Nouvelle Licence';
  actionInProgress = false;
  
  deleteModalInstance: any;
  licenseToDeleteId: number | null = null;

  // Season Generation properties
  selectedStartYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  generateSeasonModalInstance: any;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private licenseService: LicenseService,
    private clubService: ClubService
  ) {}

  ngOnInit(): void {
    this.loadLicenses();
    this.initAvailableYears();
  }

  initAvailableYears() {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let i = currentYear - 3; i <= currentYear + 3; i++) {
      this.availableYears.push(i);
    }
  }

  // Helper method to get or create Bootstrap modals safely
  private getModal(elementId: string): any {
    const el = document.getElementById(elementId);
    if (el) {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        return bootstrap.Modal.getOrCreateInstance(el);
      }
      if (typeof (window as any).bootstrap !== 'undefined' && (window as any).bootstrap.Modal) {
        return (window as any).bootstrap.Modal.getOrCreateInstance(el);
      }
    }
    return null;
  }

  loadLicenses() {
    this.loading = true;
    this.licenseService.getAllLicenses().subscribe({
      next: (data) => {
        this.licenses = data;
        this.updateTotalPages();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger les licences';
        this.loading = false;
        console.error(err);
      }
    });
  }

  confirmDelete(id: number) {
    this.licenseToDeleteId = id;
    this.deleteModalInstance = this.getModal('deleteConfirmModal');
    if (this.deleteModalInstance) this.deleteModalInstance.show();
  }

  executeDelete() {
    if (this.licenseToDeleteId) {
      this.actionInProgress = true;
      this.licenseService.deleteLicense(this.licenseToDeleteId).subscribe({
        next: () => {
          if (this.deleteModalInstance) this.deleteModalInstance.hide();
          this.success = 'Licence supprimée avec succès.';
          this.loadLicenses();
          this.actionInProgress = false;
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.actionInProgress = false;
          if (this.deleteModalInstance) this.deleteModalInstance.hide();
          this.error = 'Erreur lors de la suppression.';
          console.error(err);
        }
      });
    }
  }

  openAddModal() {
    this.selectedLicenseId = null;
    this.viewOnly = false;
    this.modalTitle = 'Créer une Licence';
    const modal = this.getModal('licenseFormModal');
    if (modal) modal.show();
  }

  openEditModal(id: number) {
    this.selectedLicenseId = id;
    this.viewOnly = false;
    this.modalTitle = 'Modifier la Licence';
    const modal = this.getModal('licenseFormModal');
    if (modal) modal.show();
  }

  openViewModal(id: number) {
    this.selectedLicenseId = id;
    this.viewOnly = true;
    this.modalTitle = 'Détails de la Licence';
    const modal = this.getModal('licenseFormModal');
    if (modal) modal.show();
  }

  onFormSaved() {
    setTimeout(() => {
      const modalElement = document.getElementById('licenseFormModal');
      if (modalElement) {
        const modalInstance = this.getModal('licenseFormModal');
        if (modalInstance) modalInstance.hide();
      }
      this.loadLicenses();
    }, 1000);
  }

  openGenerateSeasonModal() {
    this.selectedStartYear = new Date().getFullYear();
    this.generateSeasonModalInstance = this.getModal('generateSeasonModal');
    if (this.generateSeasonModalInstance) {
      this.generateSeasonModalInstance.show();
    }
  }

  generateForSeason() {
    const targetSeason = this.selectedStartYear + '-' + (this.selectedStartYear + 1);
    this.actionInProgress = true;
    this.licenseService.generateLicenses(targetSeason).subscribe({
      next: (data) => {
        this.success = `${data.length} licences générées pour la saison ${targetSeason}`;
        if (this.generateSeasonModalInstance) {
          this.generateSeasonModalInstance.hide();
        }
        this.loadLicenses();
        this.actionInProgress = false;
        setTimeout(() => this.success = '', 5000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la génération des licences';
        this.actionInProgress = false;
        console.error(err);
      }
    });
  }

  notifyCoachesForValidation() {
    const rawSeason = this.season || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    const targetSeason = rawSeason.includes('/') ? rawSeason : rawSeason.replace('-', '/');
    this.actionInProgress = true;
    this.clubService.requestSeasonValidation(targetSeason).subscribe({
      next: (res) => {
        this.success = res.message;
        this.actionInProgress = false;
        setTimeout(() => this.success = '', 6000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors de la notification des coaches';
        this.actionInProgress = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  searchTerm: string = '';

  // Pagination methods
  get filteredLicenses() {
    if (!this.searchTerm) {
      return this.licenses;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.licenses.filter(l => 
      (l.licenseNumber && l.licenseNumber.toLowerCase().includes(term)) ||
      (l.season && l.season.toLowerCase().includes(term)) ||
      (l.club?.name && l.club.name.toLowerCase().includes(term)) ||
      (l.club?.id && l.club.id.toString().includes(term))
    );
  }

  onSearchChange() {
    this.currentPage = 1;
    this.updateTotalPages();
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearchChange();
  }

  get paginatedLicenses() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLicenses.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  updateTotalPages() {
    this.totalPages = Math.ceil(this.filteredLicenses.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

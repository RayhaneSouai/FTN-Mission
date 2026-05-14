import { Component, OnInit } from '@angular/core';
import { LicenseService } from '../services/license.service';

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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private licenseService: LicenseService) { }

  ngOnInit(): void {
    this.loadLicenses();
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
  }

  openEditModal(id: number) {
    this.selectedLicenseId = id;
    this.viewOnly = false;
    this.modalTitle = 'Modifier la Licence';
  }

  openViewModal(id: number) {
    this.selectedLicenseId = id;
    this.viewOnly = true;
    this.modalTitle = 'Détails de la Licence';
  }

  onFormSaved() {
    setTimeout(() => {
      const modalElement = document.getElementById('licenseFormModal');
      if (modalElement) {
        const closeBtn = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
        if (closeBtn) closeBtn.click();
      }
      this.loadLicenses();
    }, 1000);
  }

  generateForSeason() {
    this.actionInProgress = true;
    this.licenseService.generateLicenses(this.season).subscribe({
      next: (data) => {
        this.success = `${data.length} licences générées pour la saison ${this.season}`;
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

  // Pagination methods
  get paginatedLicenses() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.licenses.slice(start, start + this.pageSize);
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
    this.totalPages = Math.ceil(this.licenses.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

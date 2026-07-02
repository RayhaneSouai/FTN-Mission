import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LicenseService } from '../services/license.service';

type LicenseDisplayStatus = 'active' | 'pending' | 'rejected' | 'expired';

@Component({
  selector: 'app-license-info',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.css']
})
export class LicenseInfoComponent {
  searchQuery: string = '';
  isSearching: boolean = false;
  searchResult: any = null;
  searchError: string | null = null;
  hasSearched: boolean = false;

  constructor(private licenseService: LicenseService) {}

  verifyLicense(): void {
    if (!this.searchQuery.trim()) {
      this.searchError = 'Veuillez saisir un numéro de licence.';
      this.searchResult = null;
      this.hasSearched = false;
      return;
    }

    this.isSearching = true;
    this.searchError = null;
    this.searchResult = null;
    this.hasSearched = true;

    const query = this.searchQuery.trim();
    this.licenseService.verifyLicense(query).subscribe({
      next: (lic) => {
        this.searchResult = lic;
        this.isSearching = false;
      },
      error: (err) => {
        this.searchError = `Aucune licence trouvée avec le numéro "${this.searchQuery}".`;
        this.isSearching = false;
        console.error(err);
      }
    });
  }

  getLicenseDisplayStatus(license: any): LicenseDisplayStatus {
    if (!license) {
      return 'rejected';
    }

    const validationStatus = license.validationStatus;

    if (validationStatus === 'REJECTED') {
      return 'rejected';
    }

    if (validationStatus === 'PENDING') {
      return 'pending';
    }

    if (validationStatus === 'VALIDATED') {
      return this.isLicenseExpired(license) ? 'expired' : 'active';
    }

    return this.isLicenseExpired(license) ? 'expired' : 'pending';
  }

  isLicenseActive(license: any): boolean {
    return this.getLicenseDisplayStatus(license) === 'active';
  }

  isLicenseExpired(license: any): boolean {
    if (!license?.expiryDate) {
      return true;
    }

    const expiry = new Date(license.expiryDate);
    expiry.setHours(23, 59, 59, 999);
    return expiry.getTime() < Date.now();
  }

  getStatusLabel(license: any): string {
    switch (this.getLicenseDisplayStatus(license)) {
      case 'active':
        return 'LICENCE ACTIVE';
      case 'pending':
        return 'LICENCE EN ATTENTE';
      case 'rejected':
        return 'LICENCE REFUSÉE';
      case 'expired':
        return 'LICENCE EXPIRÉE';
    }
  }

  getStatusBadgeClass(license: any): string {
    switch (this.getLicenseDisplayStatus(license)) {
      case 'active':
        return 'active-badge';
      case 'pending':
        return 'pending-badge';
      case 'rejected':
        return 'rejected-badge';
      case 'expired':
        return 'expired-badge';
    }
  }

  getResultBoxClass(license: any): string {
    switch (this.getLicenseDisplayStatus(license)) {
      case 'active':
        return 'success-result';
      case 'pending':
        return 'pending-result';
      case 'rejected':
        return 'rejected-result';
      case 'expired':
        return 'expired-result';
    }
  }

  getResultIconClass(license: any): string {
    switch (this.getLicenseDisplayStatus(license)) {
      case 'active':
        return 'result-icon-success';
      case 'pending':
        return 'result-icon-pending';
      case 'rejected':
        return 'result-icon-rejected';
      case 'expired':
        return 'result-icon-expired';
    }
  }

  getResultIcon(license: any): string {
    switch (this.getLicenseDisplayStatus(license)) {
      case 'active':
        return 'bi-check-circle-fill';
      case 'pending':
        return 'bi-clock-fill';
      case 'rejected':
        return 'bi-x-circle-fill';
      case 'expired':
        return 'bi-exclamation-triangle-fill';
    }
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.searchResult = null;
    this.searchError = null;
    this.hasSearched = false;
  }
}

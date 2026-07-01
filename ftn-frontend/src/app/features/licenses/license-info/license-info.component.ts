import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LicenseService } from '../services/license.service';

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

  isLicenseActive(license: any): boolean {
    if (!license?.expiryDate) return false;
    const expiry = new Date(license.expiryDate);
    return expiry.getTime() > Date.now();
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.searchResult = null;
    this.searchError = null;
    this.hasSearched = false;
  }
}

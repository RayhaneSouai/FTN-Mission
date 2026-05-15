import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../../services/club.service';
import { Club } from '../../models/club.model';
import { RegionOption } from '../../models/region.model';
import {
  ALL_GOVERNORATES,
  FTN_ZONES,
  GOVERNORATES_BY_ZONE
} from '../../models/club-location.constants';
import { ToastService } from '../../../competitions/services/toast.service';

export type ClubListMode = 'public' | 'admin';

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
  mode: ClubListMode = 'public';
  canManage = false;
  savingClub = false;

  readonly zoneOptions = FTN_ZONES;
  formZone = '';
  filteredGovernorates: RegionOption[] = [];
  formErrors: Record<string, string> = {};

  formData: Club = this.emptyClub();

  constructor(
    private clubService: ClubService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get isAdminMode(): boolean {
    return this.mode === 'admin';
  }

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data['clubMode'] as ClubListMode) ?? 'public';
    this.refreshAuthState();
    this.loadClubs();
    this.loadTopClubs();
  }

  getRegionLabel(code: string | undefined): string {
    if (!code?.trim()) return '';
    const match = ALL_GOVERNORATES.find(
      (r) => r.value === code || r.label.toLowerCase() === code.toLowerCase()
    );
    return match?.label ?? code.replace(/_/g, ' ');
  }

  private emptyClub(): Club {
    return {
      name: '',
      region: '',
      address: '',
      contact: '',
      manager: '',
      affiliationDate: ''
    };
  }

  private refreshAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.canManage = this.isAdminMode && !!localStorage.getItem('token');
    }
  }

  private requireAuth(): boolean {
    this.refreshAuthState();
    if (this.canManage) return true;
    this.toast.showError('Connectez-vous en tant qu\'administrateur pour gérer les clubs.');
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/admin/clubs' } });
    return false;
  }

  private handleWriteError(err: { status?: number; error?: { message?: string } }, action: string): void {
    if (err?.status === 403 || err?.status === 401) {
      this.toast.showError('Session expirée. Veuillez vous reconnecter.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/admin/clubs' } });
      return;
    }
    const detail = err?.error?.message;
    this.toast.showError(detail ?? `Erreur lors de ${action}.`);
  }

  loadClubs(): void {
    this.loading = true;
    this.clubService.getAll().subscribe({
      next: (data) => {
        this.clubs = data;
        this.filteredClubs = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.showError('Impossible de charger les clubs.');
      }
    });
  }

  loadTopClubs(): void {
    this.clubService.getTopClubs().subscribe({
      next: (data) => (this.topClubs = data),
      error: () => {}
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredClubs = this.clubs;
      return;
    }
    this.filteredClubs = this.clubs.filter((c) =>
      c.name.toLowerCase().includes(term) ||
      this.getRegionLabel(c.region).toLowerCase().includes(term) ||
      (c.manager ?? '').toLowerCase().includes(term)
    );
  }

  openAddForm(): void {
    if (!this.requireAuth()) return;
    this.editingClub = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(club: Club): void {
    if (!this.requireAuth()) return;
    this.editingClub = club;
    const governorate = this.normalizeRegionValue(club.region);
    this.formZone = this.inferZoneFromGovernorate(governorate);
    this.updateFilteredGovernorates();
    this.formData = {
      ...club,
      region: governorate,
      contact: this.formatContactDisplay(club.contact)
    };
    this.formErrors = {};
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingClub = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = this.emptyClub();
    this.formZone = '';
    this.filteredGovernorates = [];
    this.formErrors = {};
    this.savingClub = false;
  }

  onZoneChange(): void {
    this.formData.region = '';
    this.updateFilteredGovernorates();
    this.validateField('zone');
    this.validateField('region');
  }

  onGovernorateChange(): void {
    this.validateField('region');
  }

  onFieldChange(field: 'name' | 'contact' | 'address' | 'manager'): void {
    this.validateField(field);
  }

  /** Chiffres seuls pour la validation (8 digits TN) */
  contactDigitsOnly(): string {
    return (this.formData.contact ?? '').replace(/\D/g, '');
  }

  onContactInput(): void {
    const digits = this.contactDigitsOnly().slice(0, 8);
    this.formData.contact = digits;
    this.validateField('contact');
  }

  private normalizeRegionValue(region: string | undefined): string {
    if (!region?.trim()) return '';
    const trimmed = region.trim();
    const match = ALL_GOVERNORATES.find(
      (r) =>
        r.value === trimmed ||
        r.label.localeCompare(trimmed, 'fr', { sensitivity: 'accent' }) === 0
    );
    return match?.value ?? trimmed;
  }

  private inferZoneFromGovernorate(governorate: string): string {
    for (const [zone, list] of Object.entries(GOVERNORATES_BY_ZONE)) {
      if (list.some((g) => g.value === governorate)) return zone;
    }
    return '';
  }

  private updateFilteredGovernorates(): void {
    this.filteredGovernorates = this.formZone
      ? [...(GOVERNORATES_BY_ZONE[this.formZone] ?? [])]
      : [];
  }

  private formatContactDisplay(contact: string | undefined): string {
    return (contact ?? '').replace(/\D/g, '').slice(0, 8);
  }

  validateField(field: string): void {
    delete this.formErrors[field];

    switch (field) {
      case 'name':
        if (!this.formData.name?.trim()) {
          this.formErrors['name'] = 'Le nom du club est obligatoire.';
        } else if (this.formData.name.trim().length < 2) {
          this.formErrors['name'] = 'Le nom doit contenir au moins 2 caractères.';
        }
        break;
      case 'zone':
        if (!this.formZone) {
          this.formErrors['zone'] = 'Sélectionnez une zone FTN.';
        }
        break;
      case 'region':
        if (!this.formData.region) {
          this.formErrors['region'] = 'Sélectionnez un gouvernorat.';
        }
        break;
      case 'contact': {
        const digits = this.contactDigitsOnly();
        if (digits.length > 0 && digits.length !== 8) {
          this.formErrors['contact'] = 'Le numéro doit contenir exactement 8 chiffres (ex: 20123456).';
        }
        break;
      }
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    ['name', 'zone', 'region', 'contact'].forEach((f) => this.validateField(f));
    return Object.keys(this.formErrors).length === 0;
  }

  saveClub(): void {
    if (!this.requireAuth()) return;
    if (!this.validateForm()) {
      this.toast.showError('Corrigez les erreurs du formulaire.');
      return;
    }

    const payload: Club = {
      ...this.formData,
      name: this.formData.name.trim(),
      region: this.formData.region,
      address: this.formData.address?.trim() ?? '',
      contact: this.contactDigitsOnly(),
      manager: this.formData.manager?.trim() ?? ''
    };

    this.savingClub = true;
    const request$ = this.editingClub?.id
      ? this.clubService.update(this.editingClub.id, payload)
      : this.clubService.create(payload);

    request$.subscribe({
      next: () => {
        this.toast.showSuccess(
          this.editingClub ? 'Club modifié avec succès.' : 'Club ajouté avec succès.'
        );
        this.loadClubs();
        this.loadTopClubs();
        this.closeForm();
        this.savingClub = false;
      },
      error: (err) => {
        this.savingClub = false;
        this.handleWriteError(err, this.editingClub ? 'la modification' : 'l\'ajout');
      }
    });
  }

  deleteClub(id: number): void {
    if (!this.requireAuth()) return;
    if (!confirm('Voulez-vous vraiment supprimer ce club ?')) return;

    this.clubService.delete(id).subscribe({
      next: () => {
        this.toast.showSuccess('Club supprimé.');
        this.loadClubs();
        this.loadTopClubs();
      },
      error: (err) => this.handleWriteError(err, 'la suppression')
    });
  }

  openStats(club: Club): void {
    this.selectedClub = club;
    this.showStats = true;
    this.statistics = null;
    if (club.id) {
      this.clubService.getStatistics(club.id).subscribe({
        next: (stats) => (this.statistics = stats),
        error: () => this.toast.showError('Impossible de charger les statistiques.')
      });
    }
  }

  closeStats(): void {
    this.showStats = false;
    this.selectedClub = null;
    this.statistics = null;
  }

  getBarWidth(value: unknown): number {
    const stats = this.statistics as { totalSwimmers?: number } | null;
    const total = stats?.totalSwimmers ?? 0;
    if (!total) return 0;
    return (Number(value) / total) * 100;
  }
}

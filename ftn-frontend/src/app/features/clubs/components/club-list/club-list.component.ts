import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClubService } from '../../services/club.service';
import { Club, ClubJoinRequest, ClubDetail, ClubCompetitionSummary, ClubRanking } from '../../models/club.model';
import { RegionOption } from '../../models/region.model';
import {
  ALL_GOVERNORATES,
  FTN_ZONES,
  GOVERNORATES_BY_ZONE
} from '../../models/club-location.constants';
import { ToastService } from '../../../competitions/services/toast.service';
import { PAGE_HERO_IMAGES } from '../../../../shared/components/page-hero/page-hero.constants';
import { ToastContainerComponent } from '../../../competitions/components/toast-container/toast-container.component';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero.component';
import { ClubJoinFormComponent } from '../club-join-form/club-join-form.component';
import { ConfirmDialogComponent } from '../../../competitions/components/confirm-dialog/confirm-dialog.component';

export type ClubListMode = 'public' | 'admin';
type ClubViewMode = 'grid' | 'list';
type ClubTab = 'browse' | 'mine' | 'requests';

@Component({
  selector: 'app-club-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeroComponent, ClubJoinFormComponent, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './club-list.component.html',
  styleUrl: './club-list.component.css'
})
export class ClubListComponent implements OnInit {
  readonly heroImage = PAGE_HERO_IMAGES.clubs;
  clubs: Club[] = [];
  topClubs: ClubRanking[] = [];
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
  viewMode: ClubViewMode = 'grid';
  requestedClubIds = new Set<number>();
  rejectedClubIds = new Set<number>();
  rejectedRequestsByClubId = new Map<number, ClubJoinRequest>();
  showJoinModal = false;
  clubToJoin: Club | null = null;
  currentUser: any = null;
  activeTab: ClubTab = 'browse';
  myClubs: Club[] = [];
  myClubDetail: ClubDetail | null = null;
  myClubCompetitions: ClubCompetitionSummary[] = [];
  loadingMyClubDetail = false;
  showLeaveConfirm = false;
  leavingClub = false;
  loadingMyClubs = false;
  joinRequests: ClubJoinRequest[] = [];
  loadingJoinRequests = false;
  processingJoinRequestId: number | null = null;

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

  get canRequestClubJoin(): boolean {
    if (this.isAdminMode || !this.currentUser) {
      return false;
    }
    if (this.currentUser.role !== 'SWIMMER') {
      return false;
    }
    return !this.currentUser.clubId && this.myClubs.length === 0;
  }

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data['clubMode'] as ClubListMode) ?? 'public';
    this.refreshAuthState();
    this.loadClubs();
    this.loadTopClubs();
    if (this.isAdminMode && this.canManage) {
      this.loadJoinRequests();
    } else if (!this.isAdminMode) {
      this.loadMyClubData();
    }
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
      const userStr = sessionStorage.getItem('user');
      this.currentUser = userStr ? JSON.parse(userStr) : null;
      this.canManage = this.isAdminMode && !!sessionStorage.getItem('token');
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

  loadJoinRequests(): void {
    this.loadingJoinRequests = true;
    this.clubService.getPendingJoinRequests().subscribe({
      next: (requests) => {
        this.joinRequests = requests;
        this.loadingJoinRequests = false;
      },
      error: (err) => {
        this.loadingJoinRequests = false;
        this.handleWriteError(err, 'le chargement des demandes');
      }
    });
  }

  loadMyClubData(): void {
    if (this.isAdminMode) {
      return;
    }
    this.refreshAuthState();
    if (!this.currentUser) {
      return;
    }
    this.loadingMyClubs = true;
    this.clubService.getMyClubs().subscribe({
      next: (clubs) => {
        this.myClubs = clubs;
        this.loadingMyClubs = false;
        if (clubs.length > 0 && clubs[0].id) {
          this.syncCurrentUserClub(clubs[0]);
          this.loadMyClubDetail(clubs[0].id);
        } else {
          this.myClubDetail = null;
          this.myClubCompetitions = [];
        }
      },
      error: () => {
        this.loadingMyClubs = false;
      }
    });
    this.clubService.getMyJoinRequests().subscribe({
      next: (requests) => {
        this.requestedClubIds = new Set(
          requests.filter((r) => r.status === 'PENDING').map((r) => r.clubId)
        );
        const rejected = requests.filter((r) => r.status === 'REJECTED');
        this.rejectedClubIds = new Set(rejected.map((r) => r.clubId));
        this.rejectedRequestsByClubId = new Map(
          rejected.map((r) => [r.clubId, r])
        );
      },
      error: () => {
        this.toast.showError('Impossible de charger vos demandes d\'adhésion.');
      }
    });
  }

  private clearCurrentUserClub(): void {
    if (!isPlatformBrowser(this.platformId) || !this.currentUser) {
      return;
    }
    this.currentUser = {
      ...this.currentUser,
      clubId: null,
      clubName: null,
      clubRegion: null
    };
    localStorage.setItem('user', JSON.stringify(this.currentUser));
  }

  loadMyClubDetail(clubId: number): void {
    this.loadingMyClubDetail = true;
    this.myClubDetail = null;
    this.myClubCompetitions = [];

    this.clubService.getClubDetails(clubId).subscribe({
      next: (detail) => {
        this.myClubDetail = detail;
        this.loadingMyClubDetail = false;
      },
      error: () => {
        this.loadingMyClubDetail = false;
        this.toast.showError('Impossible de charger les détails de votre club.');
      }
    });

    this.clubService.getClubCompetitions(clubId).subscribe({
      next: (competitions) => (this.myClubCompetitions = competitions),
      error: () => {}
    });
  }

  openLeaveConfirm(): void {
    this.showLeaveConfirm = true;
  }

  cancelLeaveClub(): void {
    this.showLeaveConfirm = false;
  }

  confirmLeaveClub(): void {
    this.leavingClub = true;
    this.clubService.leaveClub().subscribe({
      next: () => {
        this.leavingClub = false;
        this.showLeaveConfirm = false;
        this.myClubs = [];
        this.myClubDetail = null;
        this.myClubCompetitions = [];
        this.clearCurrentUserClub();
        this.toast.showSuccess('Vous avez quitté votre club.');
        this.loadClubs();
        this.loadTopClubs();
      },
      error: (err) => {
        this.leavingClub = false;
        const message = err?.error?.message?.replace(/^Erreur:\s*/, '') || 'Impossible de quitter le club.';
        this.toast.showError(message);
      }
    });
  }

  formatCompetitionDates(start?: string, end?: string): string {
    if (!start && !end) return 'Dates à confirmer';
    const fmt = (value: string) =>
      new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
    if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`;
    return fmt(start || end!);
  }

  private syncCurrentUserClub(club: Club): void {
    if (!isPlatformBrowser(this.platformId) || !this.currentUser) {
      return;
    }
    this.currentUser = {
      ...this.currentUser,
      clubId: club.id,
      clubName: club.name,
      clubRegion: club.region
    };
    sessionStorage.setItem('user', JSON.stringify(this.currentUser));
  }

  approveJoinRequest(request: ClubJoinRequest): void {
    this.processingJoinRequestId = request.id;
    this.clubService.approveJoinRequest(request.id).subscribe({
      next: () => {
        this.processingJoinRequestId = null;
        this.toast.showSuccess('Demande acceptée. Le nageur est maintenant affilié au club.');
        this.loadJoinRequests();
        this.loadClubs();
        this.loadTopClubs();
      },
      error: (err) => {
        this.processingJoinRequestId = null;
        this.handleWriteError(err, 'l\'acceptation de la demande');
      }
    });
  }

  rejectJoinRequest(request: ClubJoinRequest): void {
    this.processingJoinRequestId = request.id;
    this.clubService.rejectJoinRequest(request.id).subscribe({
      next: () => {
        this.processingJoinRequestId = null;
        this.toast.showSuccess('Demande refusée.');
        this.loadJoinRequests();
      },
      error: (err) => {
        this.processingJoinRequestId = null;
        this.handleWriteError(err, 'le refus de la demande');
      }
    });
  }

  setViewMode(mode: ClubViewMode): void {
    this.viewMode = mode;
  }

  setActiveTab(tab: ClubTab): void {
    this.activeTab = tab;
    if (tab === 'mine') {
      this.loadMyClubData();
    } else if (tab === 'requests') {
      this.loadJoinRequests();
    }
  }

  hasJoinedAnyClub(): boolean {
    return this.myClubs.length > 0 || !!this.currentUser?.clubId;
  }

  shouldShowJoinButton(club: Club): boolean {
    if (this.isJoinedClub(club)) {
      return true;
    }
    return !this.hasJoinedAnyClub();
  }

  hasRejectedRequest(club: Club): boolean {
    return !!club.id && this.rejectedClubIds.has(club.id);
  }

  isJoinedClub(club: Club): boolean {
    return !!club.id && this.myClubs.some((joined) => joined.id === club.id);
  }

  joinButtonLabel(club: Club): string {
    if (this.isJoinedClub(club)) {
      return 'Membre';
    }
    if (club.id && this.requestedClubIds.has(club.id)) {
      return 'Demande envoyée';
    }
    return 'Demander à rejoindre';
  }

  isJoinButtonDisabled(club: Club): boolean {
    return this.isJoinedClub(club)
      || (!!club.id && this.requestedClubIds.has(club.id));
  }

  openJoinModal(club: Club): void {
    this.refreshAuthState();
    if (!club.id) return;

    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    if (!this.currentUser || !token) {
      this.toast.showError('Connectez-vous pour demander à rejoindre un club.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/clubs' } });
      return;
    }

    if (this.currentUser.role !== 'SWIMMER') {
      this.toast.showError('Seuls les comptes nageur peuvent demander à rejoindre un club.');
      return;
    }

    if (this.currentUser.clubId || this.myClubs.length > 0) {
      this.toast.showInfo('Vous êtes déjà affilié(e) à un club.');
      return;
    }

    if (this.requestedClubIds.has(club.id)) {
      this.toast.showInfo('Votre demande pour ce club est déjà en cours d\'examen.');
      return;
    }

    this.clubToJoin = club;
    this.showJoinModal = true;
  }

  closeJoinModal(): void {
    this.showJoinModal = false;
    this.clubToJoin = null;
  }

  onJoinCompleted(result: ClubJoinRequest): void {
    if (result.status === 'APPROVED') {
      this.rejectedClubIds.delete(result.clubId);
      this.rejectedRequestsByClubId.delete(result.clubId);
      this.myClubs = this.clubToJoin ? [...this.myClubs, this.clubToJoin] : this.myClubs;
      this.loadClubs();
      this.loadTopClubs();
      this.loadMyClubData();
    } else if (result.status === 'PENDING') {
      this.rejectedClubIds.delete(result.clubId);
      this.rejectedRequestsByClubId.delete(result.clubId);
      this.requestedClubIds.add(result.clubId);
    } else if (result.status === 'REJECTED') {
      this.rejectedClubIds.add(result.clubId);
      this.rejectedRequestsByClubId.set(result.clubId, result);
      this.requestedClubIds.delete(result.clubId);
    }
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

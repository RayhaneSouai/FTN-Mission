import { Component, NgZone, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';


declare var bootstrap: any;
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, AfterViewInit, OnDestroy {
  users: any[] = [];
  loading = true;
  error = '';
  actionInProgress = false;

  selectedUserId: number | null = null;
  isViewOnlyMode: boolean = false;
  modalTitle: string = 'Utilisateur';
  userModalInstance: any;
  deleteModalInstance: any;
  pendingReviewModalInstance: any;
  userToDeleteId: number | null = null;

  /** Vue modale : liste des demandes ou détail d’une personne */
  pendingReviewView: 'list' | 'detail' = 'list';

  /** Utilisateur dont on examine l'inscription (modal dédiée) */
  pendingReviewUser: any = null;
  /** Étape 2 du refus : évite le `window.confirm` et clarifie l'action destructive */
  pendingReviewRejectStep = false;

  /** Chargement du détail complet (GET utilisateur) */
  pendingDetailLoading = false;

  /** Infobulle à côté du titre « Décision » (vue détail) */
  readonly pendingDecisionInfoText =
    'Accepter active le compte, refuser bloque l’accès.';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  searchTerm = '';
  selectedRole = 'ALL';

  private pendingReviewModalEl: HTMLElement | null = null;
  private readonly onPendingModalHidden = () => {
    this.ngZone.run(() => {
      this.pendingReviewUser = null;
      this.pendingReviewRejectStep = false;
      this.pendingReviewView = 'list';
      this.pendingDetailLoading = false;
    });
  };

  constructor(
    private userService: UserService,
    private ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    this.pendingReviewModalEl = document.getElementById('pendingReviewModal');
    this.pendingReviewModalEl?.addEventListener('hidden.bs.modal', this.onPendingModalHidden);
  }

  ngOnDestroy(): void {
    this.pendingReviewModalEl?.removeEventListener('hidden.bs.modal', this.onPendingModalHidden);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  get pendingValidationCount(): number {
    return this.pendingUsersToReview.length;
  }

  registrationLabel(user: { registrationStatus?: string | null; active?: boolean }): string {
    const s = user.registrationStatus;
    if (s === 'EN_ATTENTE') {
      return 'En attente';
    }
    if (s === 'ANNULEE') {
      return 'Inscription refusée';
    }
    return user.active ? 'Actif' : 'Inactif';
  }

  registrationBadgeClass(user: { registrationStatus?: string | null; active?: boolean }): string {
    const s = user.registrationStatus;
    if (s === 'EN_ATTENTE') {
      return 'registration-badge--pending';
    }
    if (s === 'ANNULEE') {
      return 'bg-secondary';
    }
    return user.active ? 'bg-success' : 'bg-danger';
  }

  // Helper method to get or create Bootstrap modals safely
  private getModal(elementId: string): any {
    const el = document.getElementById(elementId);
    if (el) {
      // Ensure bootstrap is available; fallback to using the declared global
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        return bootstrap.Modal.getOrCreateInstance(el);
      }
      if (typeof (window as any).bootstrap !== 'undefined' && (window as any).bootstrap.Modal) {
        return (window as any).bootstrap.Modal.getOrCreateInstance(el);
      }
    }
    return null;
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.users = [];
          this.error = '';
        } else {
          this.users = data.map((u: any) => this.normalizeUserDto(u));
        }
        this.updateTotalPages();
        this.loading = false;
        this.actionInProgress = false;
      },
      error: (err) => {
        this.loading = false;
        this.actionInProgress = false;
        
        let errorMsg = 'Erreur lors du chargement';
        if (err?.status === 403 || err?.status === 401) {
          errorMsg = 'Accès refusé. Vous devez être administrateur pour accéder à cette page.';
        } else if (err?.status === 404) {
          errorMsg = 'Endpoint utilisateurs non trouvé.';
        } else if (err?.status === 0) {
          errorMsg = 'Impossible de contacter le serveur. Assurez-vous que le backend est démarré sur http://localhost:8083';
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        }
        
        this.error = 'Impossible de charger les utilisateurs: ' + errorMsg;
        console.error('Load error:', err);
      }
    });
  }

  private normalizeUserDto(u: any): any {
    return {
      id: u.id,
      firstName: u.firstName ?? u.first_name ?? '',
      lastName: u.lastName ?? u.last_name ?? '',
      email: u.email ?? '',
      role: u.role ?? 'VISITOR',
      active: u.active ?? false,
      registrationStatus: u.registrationStatus ?? null,
      birthDate: u.birthDate ?? null,
      gender: u.gender ?? null,
      discipline: u.discipline ?? null,
      niveau: u.niveau ?? null,
      anciennete: u.anciennete ?? null
    };
  }

  loadPendingUserDetail(userId: number): void {
    this.pendingDetailLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: (full) => {
        const merged = this.normalizeUserDto(full);
        this.pendingReviewUser = { ...this.pendingReviewUser, ...merged };
        this.pendingDetailLoading = false;
      },
      error: () => {
        this.pendingDetailLoading = false;
      }
    });
  }

  get pendingUsersToReview(): any[] {
    return this.users.filter(
      (u) => u.registrationStatus === 'EN_ATTENTE' && u.role !== 'ADMIN'
    );
  }

  isRowPendingValidation(user: { registrationStatus?: string | null; role?: string }): boolean {
    return user.registrationStatus === 'EN_ATTENTE' && user.role !== 'ADMIN';
  }

  /** Inscription refusée (ANNULEE) : pas de modification depuis la liste admin */
  isRegistrationRefused(user: { registrationStatus?: string | null }): boolean {
    return user.registrationStatus === 'ANNULEE';
  }

  openPendingValidationHub(): void {
    const pending = this.pendingUsersToReview;
    if (pending.length === 0) {
      return;
    }
    this.pendingReviewRejectStep = false;
    if (pending.length === 1) {
      this.pendingReviewUser = { ...pending[0] };
      this.pendingReviewView = 'detail';
      this.loadPendingUserDetail(pending[0].id);
    } else {
      this.pendingReviewUser = null;
      this.pendingReviewView = 'list';
    }
    this.pendingReviewModalInstance = this.getModal('pendingReviewModal');
    if (this.pendingReviewModalInstance) {
      this.pendingReviewModalInstance.show();
    }
  }

  selectPendingUserFromList(user: any): void {
    if (user.role === 'ADMIN') {
      return;
    }
    this.pendingReviewUser = { ...user };
    this.pendingReviewView = 'detail';
    this.pendingReviewRejectStep = false;
    this.loadPendingUserDetail(user.id);
  }

  backToPendingList(): void {
    this.pendingReviewUser = null;
    this.pendingReviewView = 'list';
    this.pendingReviewRejectStep = false;
    this.pendingDetailLoading = false;
  }

  closePendingReviewModal(): void {
    const m = this.pendingReviewModalInstance || this.getModal('pendingReviewModal');
    if (m) {
      m.hide();
    } else {
      this.ngZone.run(() => {
        this.pendingReviewUser = null;
        this.pendingReviewRejectStep = false;
        this.pendingReviewView = 'list';
        this.pendingDetailLoading = false;
      });
    }
  }

  approvePendingFromModal(): void {
    const id = this.pendingReviewUser?.id as number | undefined;
    if (id == null) {
      return;
    }
    this.actionInProgress = true;
    this.userService.approveUser(id).subscribe({
      next: () => {
        this.closePendingReviewModal();
        this.loadUsers();
      },
      error: (err) => {
        this.actionInProgress = false;
        this.error = "Erreur lors de l'acceptation : " + (err?.error?.message || 'Erreur inconnue');
      }
    });
  }

  beginRejectPendingFromModal(): void {
    this.pendingReviewRejectStep = true;
  }

  cancelRejectPendingFromModal(): void {
    this.pendingReviewRejectStep = false;
  }

  confirmRejectPendingFromModal(): void {
    const id = this.pendingReviewUser?.id as number | undefined;
    if (id == null) {
      return;
    }
    this.actionInProgress = true;
    this.userService.rejectUser(id).subscribe({
      next: () => {
        this.closePendingReviewModal();
        this.loadUsers();
      },
      error: (err) => {
        this.actionInProgress = false;
        this.error = 'Erreur lors du refus : ' + (err?.error?.message || 'Erreur inconnue');
      }
    });
  }

  roleLabel(role: unknown): string {
    const r = String(role ?? '');
    const map: Record<string, string> = {
      SWIMMER: 'Nageur',
      COACH: 'Coach',
      ADMIN: 'Administrateur',
      VISITOR: 'Visiteur'
    };
    return map[r] ?? r;
  }

  genderLabel(g: unknown): string {
    if (g === null || g === undefined || g === '') {
      return '—';
    }
    const v = String(g).trim();
    const map: Record<string, string> = { HOMME: 'Homme', FEMME: 'Femme' };
    return map[v] ?? v;
  }

  disciplineLabel(d: unknown): string {
    if (d === null || d === undefined || d === '') {
      return '—';
    }
    const v = String(d).trim();
    const map: Record<string, string> = {
      NATATION: 'Natation',
      EAU_LIBRE: 'Eau libre',
      WATER_POLO: 'Water-polo',
      PLONGEON: 'Plongeon',
      NAGE_SYNCHRONISEE: 'Nage synchronisée'
    };
    return map[v] ?? v;
  }

  niveauLabel(n: unknown): string {
    if (n === null || n === undefined || n === '') {
      return '—';
    }
    const v = String(n).trim();
    const map: Record<string, string> = {
      POUSSIN: 'Poussin',
      BENJAMIN: 'Benjamin',
      MINIME: 'Minime',
      CADET: 'Cadet',
      JUNIOR: 'Junior',
      SENIOR: 'Senior',
      MASTER: 'Master'
    };
    return map[v] ?? v;
  }

  formatDateFr(iso: unknown): string {
    if (iso == null || iso === '') {
      return '—';
    }
    const s = String(iso);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) {
      return s.length >= 10 ? s.slice(0, 10) : s;
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  displayOrDash(v: unknown): string {
    if (v === null || v === undefined || v === '') {
      return '—';
    }
    return String(v);
  }

  openAddModal() {
    this.selectedUserId = null;
    this.isViewOnlyMode = false;
    this.modalTitle = 'Créer un Utilisateur';
    this.userModalInstance = this.getModal('userFormModal');
    if (this.userModalInstance) this.userModalInstance.show();
  }

  openEditModal(id: number) {
    const row = this.users.find((u) => u.id === id);
    if (row && this.isRegistrationRefused(row)) {
      return;
    }
    this.selectedUserId = id;
    this.isViewOnlyMode = false;
    this.modalTitle = 'Modifier un Utilisateur';
    this.userModalInstance = this.getModal('userFormModal');
    if (this.userModalInstance) this.userModalInstance.show();
  }

  openViewModal(id: number) {
    this.selectedUserId = id;
    this.isViewOnlyMode = true;
    this.modalTitle = 'Consulter un Utilisateur';
    this.userModalInstance = this.getModal('userFormModal');
    if (this.userModalInstance) this.userModalInstance.show();
  }

  closeUserModal() {
    if (this.userModalInstance) {
      this.userModalInstance.hide();
    } else {
      // Fallback
      const modal = this.getModal('userFormModal');
      if (modal) modal.hide();
    }
  }

  onFormSaved() {
    this.closeUserModal();
    this.loadUsers();
  }

  confirmDelete(id: number) {
    this.userToDeleteId = id;
    this.deleteModalInstance = this.getModal('deleteConfirmModal');
    if (this.deleteModalInstance) this.deleteModalInstance.show();
  }

  executeDelete() {
    if (this.userToDeleteId) {
      this.actionInProgress = true;
      this.userService.deleteUser(this.userToDeleteId).subscribe({
        next: () => {
          if (this.deleteModalInstance) this.deleteModalInstance.hide();
          this.loadUsers();
        },
        error: (err) => {
          this.actionInProgress = false;
          if (this.deleteModalInstance) this.deleteModalInstance.hide();
          const errorMsg = err?.error?.message || 'Erreur lors de la suppression';
          this.error = 'Erreur lors de la suppression: ' + errorMsg;
          console.error('Delete error:', err);
        }
      });
    }
  }

  // Filtering and Search logic
  get filteredUsers() {
    return this.users.filter(u => {
      const matchRole = this.selectedRole === 'ALL' || u.role === this.selectedRole;
      const term = this.searchTerm.toLowerCase().trim();
      if (!term) return matchRole;

      const firstName = (u.firstName ?? '').toLowerCase();
      const lastName = (u.lastName ?? '').toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      const fullName1 = `${firstName} ${lastName}`;
      const fullName2 = `${lastName} ${firstName}`;

      const matchSearch =
        firstName.includes(term) ||
        lastName.includes(term) ||
        email.includes(term) ||
        fullName1.includes(term) ||
        fullName2.includes(term);

      return matchRole && matchSearch;
    });
  }

  filterByRole(role: string) {
    this.selectedRole = role;
    this.currentPage = 1;
    this.updateTotalPages();
  }

  getRoleCount(role: string): number {
    if (role === 'ALL') {
      return this.users.length;
    }
    return this.users.filter(u => u.role === role).length;
  }

  // Pagination methods
  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
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
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.updateTotalPages();
  }
}

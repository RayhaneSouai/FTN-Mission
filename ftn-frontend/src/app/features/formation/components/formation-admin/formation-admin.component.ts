import { Component, OnInit } from '@angular/core';
import {
  BrevetType,
  FormationProgram,
  FormationProgramStatus,
  FormationRegistration,
  FormationRegistrationStatus,
  FormationScheduleItem,
  ProgramType,
  Season,
  TargetCategory,
  TrainingSession
} from '../../models/formation.model';
import { SeasonService } from '../../services/season.service';
import { FormationProgramService } from '../../services/formation-program.service';
import { ToastService } from '../../../competitions/services/toast.service';

type AdminTab = 'programs' | 'registrations';

@Component({
  selector: 'app-formation-admin',
  templateUrl: './formation-admin.component.html',
  styleUrl: './formation-admin.component.css'
})
export class FormationAdminComponent implements OnInit {
  activeTab: AdminTab = 'programs';

  seasons: Season[] = [];
  programs: FormationProgram[] = [];
  selectedSeason: Season | null = null;
  loadingSeasons = true;
  loadingPrograms = false;
  saving = false;

  registrations: FormationRegistration[] = [];
  loadingRegistrations = false;
  registrationStatusFilter: FormationRegistrationStatus | 'ALL' = 'PENDING';
  processingRegistrationId: number | null = null;
  readonly registrationStatuses: FormationRegistrationStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'WAITING_LIST'];

  showSeasonForm = false;
  seasonForm: Season = { label: '', active: true };
  editingSeason: Season | null = null;

  showProgramForm = false;
  editingProgram: FormationProgram | null = null;
  programForm: FormationProgram = this.emptyProgram();

  readonly brevetTypes: BrevetType[] = ['BF1', 'BF2'];
  readonly statuses: FormationProgramStatus[] = ['DRAFT', 'PUBLISHED'];
  readonly programTypes: ProgramType[] = ['COACH_CERTIFICATION', 'SWIMMER_TRAINING'];
  readonly targetCategories: TargetCategory[] = ['AVENIRS', 'BENJAMINS', 'MINIMES', 'CADETS', 'JUNIORS', 'SENIORS'];

  sessions: TrainingSession[] = [];
  loadingSessions = false;
  sessionForm: TrainingSession = this.emptySession();
  editingSessionId: number | null = null;

  constructor(
    private seasonService: SeasonService,
    private programService: FormationProgramService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSeasons();
  }

  loadSeasons(): void {
    this.loadingSeasons = true;
    this.seasonService.getAll().subscribe({
      next: (data) => {
        this.seasons = data;
        this.loadingSeasons = false;
        if (this.selectedSeason) {
          const still = data.find((s) => s.id === this.selectedSeason!.id);
          this.selectedSeason = still ?? (data[0] ?? null);
        } else if (data.length > 0) {
          this.selectSeason(data[0]);
        }
        if (this.selectedSeason?.id) {
          this.loadPrograms();
        }
      },
      error: () => {
        this.loadingSeasons = false;
        this.toast.showError('Impossible de charger les saisons.');
      }
    });
  }

  selectSeason(season: Season): void {
    this.selectedSeason = season;
    this.loadPrograms();
    if (this.activeTab === 'registrations') {
      this.loadRegistrations();
    }
  }

  setActiveTab(tab: AdminTab): void {
    this.activeTab = tab;
    if (tab === 'registrations') {
      this.loadRegistrations();
    }
  }

  selectSeasonById(seasonId: number | null): void {
    this.selectedSeason = seasonId ? (this.seasons.find((s) => s.id === seasonId) ?? null) : null;
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loadingRegistrations = true;
    const status = this.registrationStatusFilter === 'ALL' ? undefined : this.registrationStatusFilter;
    this.programService.getAdminRegistrations(this.selectedSeason?.id, status).subscribe({
      next: (data) => {
        this.registrations = data;
        this.loadingRegistrations = false;
      },
      error: () => {
        this.loadingRegistrations = false;
        this.toast.showError('Impossible de charger les inscriptions.');
      }
    });
  }

  onRegistrationStatusFilterChange(): void {
    this.loadRegistrations();
  }

  approveRegistration(registration: FormationRegistration): void {
    this.processingRegistrationId = registration.id;
    this.programService.approveRegistration(registration.id).subscribe({
      next: () => {
        this.processingRegistrationId = null;
        this.toast.showSuccess('Inscription approuvée.');
        this.loadRegistrations();
      },
      error: (err) => {
        this.processingRegistrationId = null;
        this.toast.showError(err?.error?.message ?? 'Erreur lors de l\'approbation.');
      }
    });
  }

  rejectRegistration(registration: FormationRegistration): void {
    this.processingRegistrationId = registration.id;
    this.programService.rejectRegistration(registration.id).subscribe({
      next: () => {
        this.processingRegistrationId = null;
        this.toast.showSuccess('Inscription refusée.');
        this.loadRegistrations();
      },
      error: (err) => {
        this.processingRegistrationId = null;
        this.toast.showError(err?.error?.message ?? 'Erreur lors du refus.');
      }
    });
  }

  waitlistRegistration(registration: FormationRegistration): void {
    this.processingRegistrationId = registration.id;
    this.programService.waitlistRegistration(registration.id).subscribe({
      next: () => {
        this.processingRegistrationId = null;
        this.toast.showSuccess('Inscription placée en liste d\'attente.');
        this.loadRegistrations();
      },
      error: (err) => {
        this.processingRegistrationId = null;
        this.toast.showError(err?.error?.message ?? 'Erreur.');
      }
    });
  }

  canGenerateCertificate(registration: FormationRegistration): boolean {
    return registration.status === 'APPROVED' && registration.phase === 'COMPLETED';
  }

  generateCertificate(registration: FormationRegistration): void {
    this.processingRegistrationId = registration.id;
    this.programService.adminGenerateCertificate(registration.id).subscribe({
      next: (blob) => {
        this.processingRegistrationId = null;
        const safeTitle = (registration.program.title || 'formation').replace(/[/\\:*?"<>|]+/g, '-').trim();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificat-formation-${safeTitle}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toast.showSuccess('Certificat généré.');
      },
      error: (err) => {
        this.processingRegistrationId = null;
        this.toast.showError(err?.error?.message ?? 'Erreur lors de la génération du certificat.');
      }
    });
  }

  loadPrograms(): void {
    if (!this.selectedSeason?.id) {
      this.programs = [];
      return;
    }
    this.loadingPrograms = true;
    this.programService.getBySeason(this.selectedSeason.id).subscribe({
      next: (data) => {
        this.programs = data;
        this.loadingPrograms = false;
      },
      error: () => {
        this.loadingPrograms = false;
        this.toast.showError('Impossible de charger les programmes.');
      }
    });
  }

  openAddSeason(): void {
    this.editingSeason = null;
    this.seasonForm = { label: '', active: true };
    this.showSeasonForm = true;
  }

  openEditSeason(season: Season, event: Event): void {
    event.stopPropagation();
    this.editingSeason = season;
    this.seasonForm = { ...season };
    this.showSeasonForm = true;
  }

  closeSeasonForm(): void {
    this.showSeasonForm = false;
    this.editingSeason = null;
  }

  saveSeason(): void {
    const label = this.seasonForm.label?.trim();
    if (!label) {
      this.toast.showError('Le libellé de la saison est obligatoire (ex: 2024-2025).');
      return;
    }
    this.saving = true;
    const payload: Season = { label, active: this.seasonForm.active };
    const req$ = this.editingSeason?.id
      ? this.seasonService.update(this.editingSeason.id, payload)
      : this.seasonService.create(payload);

    req$.subscribe({
      next: () => {
        this.toast.showSuccess(this.editingSeason ? 'Saison modifiée.' : 'Saison créée.');
        this.closeSeasonForm();
        this.loadSeasons();
        this.saving = false;
      },
      error: (err) => {
        this.saving = false;
        this.toast.showError(err?.error?.message ?? 'Erreur lors de l\'enregistrement de la saison.');
      }
    });
  }

  deleteSeason(season: Season, event: Event): void {
    event.stopPropagation();
    if (!season.id || !confirm(`Supprimer la saison « ${season.label} » ?`)) return;
    this.seasonService.delete(season.id).subscribe({
      next: () => {
        this.toast.showSuccess('Saison supprimée.');
        if (this.selectedSeason?.id === season.id) {
          this.selectedSeason = null;
          this.programs = [];
        }
        this.loadSeasons();
      },
      error: (err) => {
        this.toast.showError(err?.error?.message ?? 'Impossible de supprimer cette saison.');
      }
    });
  }

  openAddProgram(): void {
    if (!this.selectedSeason?.id) {
      this.toast.showError('Sélectionnez ou créez une saison d\'abord.');
      return;
    }
    this.editingProgram = null;
    this.programForm = this.emptyProgram();
    this.programForm.season = { id: this.selectedSeason.id };
    this.showProgramForm = true;
  }

  openEditProgram(program: FormationProgram): void {
    this.editingProgram = program;
    this.programService.getById(program.id!).subscribe({
      next: (full) => {
        this.programForm = {
          ...full,
          scheduleItems: full.scheduleItems?.length
            ? full.scheduleItems.map((s, i) => ({ ...s, sortOrder: s.sortOrder ?? i }))
            : [this.emptyScheduleRow()]
        };
        this.showProgramForm = true;
        if (full.programType === 'SWIMMER_TRAINING' && full.id) {
          this.loadSessions(full.id);
        }
      },
      error: () => this.toast.showError('Impossible de charger le programme.')
    });
  }

  closeProgramForm(): void {
    this.showProgramForm = false;
    this.editingProgram = null;
    this.sessions = [];
    this.editingSessionId = null;
    this.sessionForm = this.emptySession();
  }

  // ─── Training sessions (swimmer programs) ───────────────────────────────────

  loadSessions(programId: number): void {
    this.loadingSessions = true;
    this.programService.getSessions(programId).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loadingSessions = false;
      },
      error: () => {
        this.loadingSessions = false;
        this.toast.showError('Impossible de charger les séances.');
      }
    });
  }

  openAddSession(): void {
    this.editingSessionId = null;
    this.sessionForm = this.emptySession();
  }

  editSession(session: TrainingSession): void {
    this.editingSessionId = session.id ?? null;
    this.sessionForm = { ...session };
  }

  saveSession(): void {
    if (!this.editingProgram?.id) return;
    if (!this.sessionForm.sessionDate || !this.sessionForm.startTime || !this.sessionForm.endTime) {
      this.toast.showError('Date et horaires sont obligatoires.');
      return;
    }
    const programId = this.editingProgram.id;
    const req$ = this.editingSessionId
      ? this.programService.updateSession(programId, this.editingSessionId, this.sessionForm)
      : this.programService.createSession(programId, this.sessionForm);

    req$.subscribe({
      next: () => {
        this.toast.showSuccess(this.editingSessionId ? 'Séance modifiée.' : 'Séance ajoutée.');
        this.openAddSession();
        this.loadSessions(programId);
      },
      error: (err) => this.toast.showError(err?.error?.message ?? 'Erreur lors de l\'enregistrement de la séance.')
    });
  }

  deleteSession(session: TrainingSession): void {
    if (!this.editingProgram?.id || !session.id || !confirm('Supprimer cette séance ?')) return;
    this.programService.deleteSession(this.editingProgram.id, session.id).subscribe({
      next: () => {
        this.toast.showSuccess('Séance supprimée.');
        this.loadSessions(this.editingProgram!.id!);
      },
      error: (err) => this.toast.showError(err?.error?.message ?? 'Erreur lors de la suppression.')
    });
  }

  private emptySession(): TrainingSession {
    return { sessionDate: '', startTime: '', endTime: '', location: '', notes: '', status: 'SCHEDULED' };
  }

  addScheduleRow(): void {
    this.programForm.scheduleItems.push(this.emptyScheduleRow());
  }

  removeScheduleRow(index: number): void {
    if (this.programForm.scheduleItems.length <= 1) return;
    this.programForm.scheduleItems.splice(index, 1);
  }

  saveProgram(): void {
    if (!this.programForm.title?.trim()) {
      this.toast.showError('Le titre est obligatoire.');
      return;
    }
    if (!this.selectedSeason?.id) {
      this.toast.showError('Saison manquante.');
      return;
    }

    const payload: FormationProgram = {
      ...this.programForm,
      title: this.programForm.title.trim(),
      season: { id: this.selectedSeason.id },
      scheduleItems: this.programForm.scheduleItems
        .filter((s) => s.dayLabel?.trim() || s.content?.trim())
        .map((s, i) => ({ ...s, sortOrder: i }))
    };

    this.saving = true;
    const req$ = this.editingProgram?.id
      ? this.programService.update(this.editingProgram.id, payload)
      : this.programService.create(payload);

    req$.subscribe({
      next: () => {
        this.toast.showSuccess(this.editingProgram ? 'Programme modifié.' : 'Programme créé.');
        this.closeProgramForm();
        this.loadPrograms();
        this.saving = false;
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message as string | undefined;
        this.toast.showError(msg?.replace(/^Erreur:\s*/i, '') ?? 'Erreur lors de l\'enregistrement.');
      }
    });
  }

  deleteProgram(program: FormationProgram): void {
    if (!program.id || !confirm(`Supprimer « ${program.title} » ?`)) return;
    this.programService.delete(program.id).subscribe({
      next: () => {
        this.toast.showSuccess('Programme supprimé.');
        this.loadPrograms();
      },
      error: (err) => {
        this.toast.showError(err?.error?.message ?? 'Erreur lors de la suppression.');
      }
    });
  }

  statusLabel(status: FormationProgramStatus): string {
    return status === 'PUBLISHED' ? 'Publié' : 'Brouillon';
  }

  onProgramTypeChange(): void {
    if (this.programForm.programType === 'SWIMMER_TRAINING') {
      this.programForm.brevetType = undefined;
    } else {
      this.programForm.brevetType = this.programForm.brevetType ?? 'BF1';
      this.programForm.targetCategory = undefined;
      this.programForm.coach = undefined;
    }
  }

  private emptyProgram(): FormationProgram {
    return {
      title: '',
      programType: 'COACH_CERTIFICATION',
      brevetType: 'BF1',
      season: { id: 0 },
      status: 'DRAFT',
      registrationConditions: '',
      scheduleItems: [this.emptyScheduleRow()]
    };
  }

  private emptyScheduleRow(): FormationScheduleItem {
    return { sortOrder: 0, dayLabel: '', timeSlot: '', content: '' };
  }
}

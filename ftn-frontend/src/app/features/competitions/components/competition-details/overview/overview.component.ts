import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CompetitionStateService } from '../../../services/competition-state.service';
import { CompetitionApiService } from '../../../services/competition-api.service';
import { ToastService } from '../../../services/toast.service';
import {
  DISCIPLINE_LABELS,
  REGION_LABELS,
  PISCINE_LABELS,
  CATEGORIE_LABELS,
  PARTICIPATION_STATUS_LABELS,
  Categorie,
  determineAgeCategory,
} from '../../../models/competition.model';
import { ProgrammeReadonlyComponent } from '../programme/programme-readonly.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [DatePipe, ProgrammeReadonlyComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent implements OnInit {
  protected readonly state = inject(CompetitionStateService);
  private readonly api = inject(CompetitionApiService);
  private readonly toast = inject(ToastService);

  isSwimmer = signal(false);
  isLoggedIn = signal(false);
  submitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  showAllCategories = signal(false);

  /** Derived from state service */
  readonly participationStatus = this.state.participationStatus;
  readonly hasProgramme = this.state.hasProgramme;
  readonly hasExistingRequest = computed(() => this.participationStatus() !== 'NONE');

  readonly hasConditions = computed(() => {
    const comp = this.state.selectedCompetition();
    if (!comp) return false;
    return !!(comp.allowedGender || comp.minAge || comp.maxAge || comp.maxEvents || comp.customConditions
      || comp.participationDeadline || (comp.allowedCategories && comp.allowedCategories.length));
  });

  readonly hasCustomConditions = computed(() => {
    const comp = this.state.selectedCompetition();
    return !!(comp?.customConditions);
  });

  private userBirthDate: string | null = null;

  ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.isLoggedIn.set(true);
        this.isSwimmer.set(user.role === 'SWIMMER');
        this.userBirthDate = user.birthDate ?? null;
      }
    } catch { /* not logged in */ }
  }

  isDeadlinePassed(): boolean {
    const comp = this.state.selectedCompetition();
    if (!comp?.participationDeadline) return false;
    const today = new Date().toISOString().split('T')[0];
    return today > comp.participationDeadline;
  }

  isCategoryIneligible(): boolean {
    const comp = this.state.selectedCompetition();
    if (!comp?.allowedCategories || comp.allowedCategories.length === 0) return false;
    if (!this.userBirthDate || !comp.startDate) return false;
    const swimmerCat = determineAgeCategory(this.userBirthDate, comp.startDate);
    return !comp.allowedCategories.includes(swimmerCat);
  }

  swimmerCategoryLabel(): string {
    const comp = this.state.selectedCompetition();
    if (!this.userBirthDate || !comp?.startDate) return '';
    const cat = determineAgeCategory(this.userBirthDate, comp.startDate);
    return (CATEGORIE_LABELS as Record<string, string>)[cat] ?? cat;
  }

  requestParticipation(): void {
    const comp = this.state.selectedCompetition();
    if (!comp || this.submitting()) return;

    this.submitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.api.requestParticipation(comp.id).subscribe({
      next: () => {
        this.state.updateParticipationStatus('PENDING');
        this.successMessage.set('Demande soumise avec succès ! Votre participation est en attente d\'approbation.');
        this.submitting.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erreur lors de la demande de participation.';
        this.errorMessage.set(msg);
        this.toast.showError(msg);
        this.submitting.set(false);
      }
    });
  }

  participationStatusLabel(status: string): string {
    return (PARTICIPATION_STATUS_LABELS as Record<string, string>)[status] ?? status;
  }

  disciplineLabel(d: string): string {
    return (DISCIPLINE_LABELS as Record<string, string>)[d] ?? d;
  }

  regionLabel(r: string): string {
    return (REGION_LABELS as Record<string, string>)[r] ?? r;
  }

  piscineLabel(p: string): string {
    return (PISCINE_LABELS as Record<string, string>)[p] ?? p;
  }

  categorieLabel(c: string): string {
    return (CATEGORIE_LABELS as Record<string, string>)[c] ?? c;
  }
}

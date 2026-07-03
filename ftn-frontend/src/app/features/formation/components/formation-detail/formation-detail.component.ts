import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormationProgram, FormationRegistration } from '../../models/formation.model';
import { FormationProgramService } from '../../services/formation-program.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AiEligibilityPanelComponent } from '../ai-eligibility-panel/ai-eligibility-panel.component';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AiEligibilityPanelComponent],
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.css'
})
export class FormationDetailComponent implements OnInit {
  program: FormationProgram | null = null;
  loading = true;
  isLoggedIn = false;
  isSwimmer = false;
  currentUserId: number | null = null;
  showGuestPrompt = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  eligibilityResult: { eligible: boolean; message: string; error?: boolean } | null = null;
  isCheckingEligibility = false;
  existingRegistration: FormationRegistration | null = null;
  isRegistering = false;

  constructor(
    private route: ActivatedRoute,
    private programService: FormationProgramService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.isSwimmer = user?.role === 'SWIMMER';
      this.currentUserId = user?.id ?? null;
      if (this.isSwimmer && this.program?.id) {
        this.loadMyRegistration(this.program.id);
      }
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programService.getById(id).subscribe({
      next: (program) => {
        this.program = program;
        this.loading = false;
        if (this.isSwimmer) {
          this.loadMyRegistration(id);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadMyRegistration(programId: number): void {
    this.programService.getMyRegistrations().subscribe({
      next: (registrations) => {
        this.existingRegistration = registrations.find((item) => item.program.id === programId) ?? null;
      },
      error: () => {}
    });
  }

  checkEligibility(): void {
    if (!this.program?.id || !this.currentUserId) {
      this.showGuestPrompt = true;
      return;
    }
    this.isCheckingEligibility = true;
    this.eligibilityResult = null;
    this.programService.checkEligibility(this.currentUserId, this.program.id).subscribe({
      next: (result) => {
        this.eligibilityResult = {
          eligible: !!result?.eligible,
          message: result?.message ?? '',
          error: !!result?.error
        };
        this.isCheckingEligibility = false;
      },
      error: () => {
        this.eligibilityResult = {
          eligible: false,
          message: 'Impossible de contacter le service de vérification. Réessayez plus tard.',
          error: true
        };
        this.isCheckingEligibility = false;
      }
    });
  }

  register(): void {
    if (!this.program?.id || !this.canRegister()) {
      return;
    }

    this.feedbackMessage = '';
    this.feedbackType = '';
    this.showGuestPrompt = false;

    if (!this.isLoggedIn || !this.isSwimmer) {
      this.showGuestPrompt = true;
      return;
    }

    this.isRegistering = true;
    this.programService.register(this.program.id).subscribe({
      next: (registration) => {
        this.existingRegistration = registration;
        this.feedbackMessage = 'Votre demande d\'inscription a été envoyée. L\'administration l\'examinera avant le début de la formation.';
        this.feedbackType = 'success';
        this.isRegistering = false;
      },
      error: (error) => {
        this.feedbackMessage = error?.error?.message || error?.error?.error || 'L\'inscription n\'a pas pu être effectuée.';
        this.feedbackType = 'error';
        this.isRegistering = false;
      }
    });
  }

  canRegister(): boolean {
    if (!this.program || this.program.status !== 'PUBLISHED') {
      return false;
    }
    if (this.existingRegistration) {
      return false;
    }
    return this.resolveProgramState() === 'OPEN';
  }

  get registrationStatusLabel(): string {
    if (!this.existingRegistration) {
      return '';
    }
    const labels: Record<string, string> = {
      PENDING: 'Demande en attente de validation',
      APPROVED: 'Inscription approuvée',
      REJECTED: 'Demande refusée',
      WAITING_LIST: 'En liste d\'attente'
    };
    return labels[this.existingRegistration.status] ?? this.existingRegistration.status;
  }

  resolveProgramStateLabel(): string {
    const labels: Record<string, string> = {
      OPEN: 'Inscriptions ouvertes',
      UPCOMING: 'À venir',
      CLOSED: 'Inscriptions fermées',
      ARCHIVED: 'Archivée'
    };
    return labels[this.resolveProgramState()];
  }

  isPastFormation(): boolean {
    if (!this.program?.season?.active) {
      return true;
    }
    const end = this.resolveFormationEndDate();
    const today = this.startOfDay(new Date());
    return !!end && end < today;
  }

  resolveProgramState(): 'OPEN' | 'UPCOMING' | 'CLOSED' | 'ARCHIVED' {
    if (!this.program?.season?.active || this.isPastFormation()) {
      return 'ARCHIVED';
    }
    const today = this.startOfDay(new Date());
    const start = this.program.registrationStartDate ? this.startOfDay(new Date(this.program.registrationStartDate)) : null;
    if (start && start > today) {
      return 'UPCOMING';
    }
    const end = this.program.registrationEndDate ? this.startOfDay(new Date(this.program.registrationEndDate)) : null;
    if (end && end < today) {
      return 'CLOSED';
    }
    return 'OPEN';
  }

  formatDate(value?: string): string {
    if (!value) return 'À confirmer';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return 'Dates à confirmer';
    if (start && end) return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    return this.formatDate(start || end);
  }

  private resolveFormationEndDate(): Date | null {
    if (!this.program) {
      return null;
    }
    const endValue = this.program.practicalPeriodEnd || this.program.theoreticalEndDate;
    return endValue ? this.startOfDay(new Date(endValue)) : null;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}

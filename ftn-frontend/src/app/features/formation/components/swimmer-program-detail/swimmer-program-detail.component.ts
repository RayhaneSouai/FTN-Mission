import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormationProgram, FormationRegistration, TrainingSession } from '../../models/formation.model';
import { FormationProgramService } from '../../services/formation-program.service';
import { AuthService } from '../../../auth/services/auth.service';
import {
  canRegisterToProgram,
  programStateLabel,
  registrationStatusLabel,
  resolveProgramState
} from '../../utils/formation-registration.util';

import { AiEligibilityPanelComponent } from '../ai-eligibility-panel/ai-eligibility-panel.component';

@Component({
  selector: 'app-swimmer-program-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AiEligibilityPanelComponent],
  templateUrl: './swimmer-program-detail.component.html',
  styleUrl: '../formation-detail/formation-detail.component.css'
})
export class SwimmerProgramDetailComponent implements OnInit {
  program: FormationProgram | null = null;
  sessions: TrainingSession[] = [];
  loading = true;
  loadingSessions = false;
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
        this.loadSessions(id);
        if (this.isSwimmer) {
          this.loadMyRegistration(id);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadSessions(programId: number): void {
    this.loadingSessions = true;
    this.programService.getSessions(programId).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loadingSessions = false;
      },
      error: () => {
        this.loadingSessions = false;
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
        this.feedbackMessage = 'Votre demande d\'inscription a été envoyée. L\'administration l\'examinera avant le début du programme.';
        this.feedbackType = 'success';
        this.isRegistering = false;
      },
      error: (error) => {
        this.feedbackMessage = error?.error?.message || 'L\'inscription n\'a pas pu être effectuée.';
        this.feedbackType = 'error';
        this.isRegistering = false;
      }
    });
  }

  canRegister(): boolean {
    if (!this.program || this.existingRegistration) {
      return false;
    }
    const remaining = this.spotsRemaining();
    if (remaining !== null && remaining <= 0) {
      return false;
    }
    return canRegisterToProgram(this.program);
  }

  get registrationStatusLabel(): string {
    if (!this.existingRegistration) {
      return '';
    }
    return registrationStatusLabel(this.existingRegistration.status);
  }

  resolveProgramStateLabel(): string {
    if (!this.program) {
      return '';
    }
    return programStateLabel(resolveProgramState(this.program));
  }

  spotsRemaining(): number | null {
    if (!this.program || this.program.maxParticipants == null) return null;
    return Math.max(0, this.program.maxParticipants - (this.program.registeredCount ?? 0));
  }

  coachName(): string {
    if (!this.program?.coach) return 'Non assigné';
    return `${this.program.coach.firstName ?? ''} ${this.program.coach.lastName ?? ''}`.trim() || 'Non assigné';
  }

  formatDate(value?: string): string {
    if (!value) return 'À confirmer';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return 'Dates à confirmer';
    if (start && end) return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    return this.formatDate(start || end);
  }

  formatTime(value?: string): string {
    if (!value) return '';
    return value.slice(0, 5);
  }
}

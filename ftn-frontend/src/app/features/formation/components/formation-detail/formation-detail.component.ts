import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormationProgram } from '../../models/formation.model';
import { FormationProgramService } from '../../services/formation-program.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.css'
})
export class FormationDetailComponent implements OnInit {
  program: FormationProgram | null = null;
  loading = true;
  isLoggedIn = false;
  isSwimmer = false;
  showGuestPrompt = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  eligibilityResult: { eligible: boolean; explanation: string } | null = null;
  isCheckingEligibility = false;

  constructor(
    private route: ActivatedRoute,
    private programService: FormationProgramService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.isSwimmer = user?.role === 'SWIMMER';
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programService.getById(id).subscribe({
      next: (program) => {
        this.program = program;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  checkEligibility(): void {
    if (!this.program?.id || !this.isLoggedIn) {
      this.showGuestPrompt = true;
      return;
    }
    this.isCheckingEligibility = true;
    this.eligibilityResult = null;
    this.programService.checkEligibility(this.program.id).subscribe({
      next: (result) => {
        this.eligibilityResult = result;
        this.isCheckingEligibility = false;
      },
      error: () => {
        this.eligibilityResult = { eligible: false, explanation: 'Impossible de contacter le service de vérification.' };
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

    this.programService.register(this.program.id).subscribe({
      next: () => {
        this.feedbackMessage = 'Your registration request has been submitted and is pending review.';
        this.feedbackType = 'success';
      },
      error: (error) => {
        this.feedbackMessage = error?.error?.message || error?.error?.error || 'Registration could not be completed.';
        this.feedbackType = 'error';
      }
    });
  }

  canRegister(): boolean {
    if (!this.program?.season?.active || this.program.status !== 'PUBLISHED') {
      return false;
    }
    return !this.isPastFormation();
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
    return 'OPEN';
  }

  formatDate(value?: string): string {
    if (!value) return 'To be confirmed';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return 'Dates to be confirmed';
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

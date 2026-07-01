import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProgrammeApiService } from '../../competitions/services/programme-api.service';
import { CompetitionApiService } from '../../competitions/services/competition-api.service';
import { Competition, ProgrammeStatusResponse } from '../../competitions/models/competition.model';
import { ProgrammeStepperComponent } from '../../competitions/components/competition-details/programme/programme-stepper.component';
import { ConfirmDialogComponent } from '../../competitions/components/competition-details/programme/confirm-dialog.component';
import { ToastService } from '../../competitions/services/toast.service';
import { ToastContainerComponent } from '../../competitions/components/toast-container/toast-container.component';

@Component({
  selector: 'app-admin-programme',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgrammeStepperComponent, ConfirmDialogComponent, ToastContainerComponent],
  template: `
    <app-toast-container />
    <div class="admin-programme">
      <div class="admin-header">
        <a routerLink="/admin/competitions" class="back-link">← Retour aux compétitions</a>
        @if (competition()) {
          <h2>Programme : {{ competition()!.name }}</h2>
        }
      </div>

      @if (competition()) {
        <!-- Status badge -->
        <div class="status-bar">
          <span class="status-badge" [class.draft]="getCurrentStatus() === 'DRAFT'" [class.approved]="getCurrentStatus() === 'APPROVED'">
            {{ getCurrentStatus() === 'APPROVED' ? '✓ Approuvé' : getCurrentStatus() === 'DRAFT' ? '⏳ Brouillon' : 'Non généré' }}
          </span>

          @if (getCurrentStatus() !== 'APPROVED') {
            <button class="btn btn-success" [disabled]="!canApprove()" (click)="showApproveDialog.set(true)">
              ✓ Approuver le programme
            </button>
          }
        </div>

        @if (getCurrentStatus() === 'APPROVED') {
          <div class="lock-notice">
            <span class="material-symbols-outlined" aria-hidden="true">lock</span>
            Cette compétition est verrouillée car le programme a été approuvé. Aucune modification n'est possible.
          </div>
        }

        <!-- Programme stepper (full CRUD) -->
        <app-programme-stepper #stepper [inputCompetitionId]="competition()!.id"></app-programme-stepper>
      } @else {
        <div class="loading">Chargement...</div>
      }
    </div>

    <!-- Approve confirmation dialog -->
    <app-confirm-dialog
      [visible]="showApproveDialog()"
      title="Approuver le programme"
      message="Une fois approuvé, le programme sera visible publiquement. Continuer ?"
      confirmLabel="Approuver"
      (confirmed)="onApproveConfirmed()"
      (cancelled)="showApproveDialog.set(false)">
    </app-confirm-dialog>
  `,
  styles: [`
    .admin-programme { padding: 1.5rem; }
    .admin-header {
      margin-bottom: 1.5rem;
      h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; margin: 0.5rem 0 0; }
    }
    .back-link {
      font-size: 0.85rem;
      color: #1565C0;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .status-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    .status-badge {
      padding: 0.35rem 0.8rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      &.draft { background: #fff3cd; color: #856404; }
      &.approved { background: #d1e7dd; color: #0f5132; }
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-success {
      background: #198754;
      color: white;
      &:hover:not(:disabled) { background: #157347; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .lock-notice {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.75rem 1rem;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      color: #664d03;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
      .material-symbols-outlined { font-size: 18px; }
    }
    .loading { text-align: center; padding: 3rem; color: #6c757d; }
  `]
})
export class AdminProgrammeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly competitionApi = inject(CompetitionApiService);
  private readonly programmeApi = inject(ProgrammeApiService);
  private readonly toast = inject(ToastService);

  @ViewChild('stepper') stepper?: ProgrammeStepperComponent;

  competition = signal<Competition | null>(null);
  programmeStatus = signal<string | null>(null);
  showApproveDialog = signal(false);

  /** Derives current programme status from stepper (reactive) or initial load */
  getCurrentStatus(): string | null {
    return this.stepper?.status()?.programmeStatus ?? this.programmeStatus();
  }

  /** Reactive check: enabled when DRAFT + all days have ≥ 2 items */
  canApprove(): boolean {
    const status = this.getCurrentStatus();
    if (status !== 'DRAFT') return false;
    const days = this.stepper?.days() ?? [];
    if (days.length === 0) return false;
    return days.every(d => d.items.length >= 2);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.competitionApi.getById(id).subscribe(res => {
        this.competition.set(res.competition);
        this.programmeStatus.set(res.competition.programmeStatus ?? null);
      });
    }
  }

  onApproveConfirmed(): void {
    this.showApproveDialog.set(false);
    const comp = this.competition();
    if (!comp) return;
    this.programmeApi.approveProgramme(comp.id).subscribe({
      next: () => {
        this.toast.showSuccess('Programme approuvé avec succès');
        this.router.navigate(['/admin/competitions']);
      }
    });
  }

  goToDistribution(): void {
    const comp = this.competition();
    if (!comp) return;
    this.router.navigate(['/admin/competitions', comp.id, 'distribution']);
  }
}

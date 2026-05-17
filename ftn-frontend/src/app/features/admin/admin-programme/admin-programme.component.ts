import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProgrammeApiService } from '../../competitions/services/programme-api.service';
import { CompetitionApiService } from '../../competitions/services/competition-api.service';
import { Competition, ProgrammeStatusResponse } from '../../competitions/models/competition.model';
import { ProgrammeStepperComponent } from '../../competitions/components/competition-details/programme/programme-stepper.component';
import { ConfirmDialogComponent } from '../../competitions/components/competition-details/programme/confirm-dialog.component';

@Component({
  selector: 'app-admin-programme',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgrammeStepperComponent, ConfirmDialogComponent],
  template: `
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
          <span class="status-badge" [class.draft]="programmeStatus() === 'DRAFT'" [class.approved]="programmeStatus() === 'APPROVED'">
            {{ programmeStatus() === 'APPROVED' ? '✓ Approuvé' : programmeStatus() === 'DRAFT' ? '⏳ Brouillon' : 'Non généré' }}
          </span>

          @if (programmeStatus() === 'DRAFT') {
            <button class="btn btn-success" (click)="showApproveDialog.set(true)">
              ✓ Approuver le programme
            </button>
          }
        </div>

        <!-- Programme stepper (full CRUD) -->
        <app-programme-stepper [inputCompetitionId]="competition()!.id"></app-programme-stepper>
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
      &:hover { background: #157347; }
    }
    .loading { text-align: center; padding: 3rem; color: #6c757d; }
  `]
})
export class AdminProgrammeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly competitionApi = inject(CompetitionApiService);
  private readonly programmeApi = inject(ProgrammeApiService);

  competition = signal<Competition | null>(null);
  programmeStatus = signal<string | null>(null);
  showApproveDialog = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.competitionApi.getById(id).subscribe(comp => {
        this.competition.set(comp);
        this.programmeStatus.set(comp.programmeStatus ?? null);
      });
    }
  }

  onApproveConfirmed(): void {
    this.showApproveDialog.set(false);
    const comp = this.competition();
    if (!comp) return;
    this.programmeApi.approveProgramme(comp.id).subscribe({
      next: (res) => {
        this.programmeStatus.set(res.programmeStatus);
      }
    });
  }
}

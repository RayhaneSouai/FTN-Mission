import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminParticipationApiService } from './admin-participation-api.service';
import {
  ParticipationResponseDTO,
  PARTICIPATION_STATUS_LABELS,
} from '../../competitions/models/competition.model';
import { ToastService } from '../../competitions/services/toast.service';
import { ToastContainerComponent } from '../../competitions/components/toast-container/toast-container.component';

@Component({
  selector: 'app-admin-participations',
  standalone: true,
  imports: [CommonModule, ToastContainerComponent],
  template: `
    <app-toast-container />
    <div class="admin-participations">
      <div class="page-header">
        <div>
          <h2>Demandes de Participation</h2>
          <p class="subtitle">Gérez les demandes de participation des nageurs aux compétitions.</p>
        </div>
       
      </div>

      <!-- Demandes tab only -->
      <div class="table-wrap">
        <table class="req-table">
          <thead>
            <tr>
              <th>Nageur</th>
              <th>Compétition</th>
              <th>Date de demande</th>
              <th>Statut</th>
              <th>Motif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (req of requests(); track req.id) {
              <tr>
                <td class="name-cell">{{ req.swimmerFirstName }} {{ req.swimmerLastName }}</td>
                <td>{{ req.competitionName }}</td>
                <td>{{ req.requestedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="badge"
                    [class.pending]="req.status === 'PENDING'"
                    [class.approved]="req.status === 'APPROVED'"
                    [class.rejected]="req.status === 'REJECTED'">
                    {{ statusLabel(req.status) }}
                  </span>
                </td>
                <td>
                  @if (req.rejectionReason) {
                    <div class="reason-cell">{{ req.rejectionReason }}</div>
                  } @else {
                    <span class="no-conditions">—</span>
                  }
                </td>
                <td class="action-cell admin-row-actions">
                  @if (req.status === 'PENDING') {
                    <button class="admin-action-label"
                      (click)="approve(req)"
                      [disabled]="processing().has(req.id)">
                      <span class="material-symbols-outlined" aria-hidden="true">check</span>
                      Approuver
                    </button>
                    <button class="admin-action-label"
                      (click)="reject(req)"
                      [disabled]="processing().has(req.id)">
                      <span class="material-symbols-outlined" aria-hidden="true">close</span>
                      Rejeter
                    </button>
                  } @else {
                    <span class="handled">Traité</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (requests().length === 0) {
        <div class="empty">Aucune demande de participation.</div>
      }
      


    </div>
  `,
  styles: [`
    .admin-participations { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.25rem; }
    .subtitle { color: #6c757d; font-size: 0.85rem; margin: 0; }
    .table-wrap { overflow-x: auto; }
    .req-table {
      width: 100%; border-collapse: collapse; font-size: 0.85rem;
      th, td { padding: 0.65rem 0.75rem; text-align: left; border-bottom: 1px solid #e9ecef; }
      th { background: #f8f9fa; font-weight: 600; color: #495057; }
    }
    .name-cell { font-weight: 600; }
    .badge {
      padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;
      &.pending { background: #fff3cd; color: #856404; }
      &.approved { background: #d1e7dd; color: #0f5132; }
      &.rejected { background: #f8d7da; color: #842029; }
    }
    .action-cell { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .handled { color: #6c757d; font-size: 0.8rem; font-style: italic; }
    .empty { text-align: center; padding: 3rem; color: #6c757d; font-size: 0.9rem; }
    .custom-conditions-cell {
      font-size: 0.8rem; color: #5d4037; background: #fffde7; padding: 6px 10px;
      border-radius: 6px; max-width: 250px; line-height: 1.4; white-space: pre-wrap;
    }
    .no-conditions { color: #9e9e9e; font-size: 0.8rem; font-style: italic; }
    .reason-cell {
      font-size: 0.8rem; color: #5d4037; background: #fffde7; padding: 6px 10px;
      border-radius: 6px; max-width: 250px; line-height: 1.4; white-space: pre-wrap;
    }
    .tab-bar { display: flex; gap: 0.5rem; }
    .tab {
      padding: 0.4rem 1rem; border: 1px solid #dee2e6; border-radius: 6px;
      background: white; cursor: pointer; font-size: 0.85rem; font-weight: 600;
      &.active { background: #e7f1ff; border-color: #0d6efd; color: #0d6efd; }
    }
  `]
})
export class AdminParticipationsComponent implements OnInit {
  private readonly api = inject(AdminParticipationApiService);
  private readonly toast = inject(ToastService);

  requests = signal<ParticipationResponseDTO[]>([]);
  processing = signal<Set<number>>(new Set());
  activeTab = signal<'requests' | 'audit'>('requests');
  auditTrail = signal<any[]>([]);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.api.getAll().subscribe(reqs => this.requests.set(reqs));
  }

  statusLabel(s: string): string {
    return (PARTICIPATION_STATUS_LABELS as Record<string, string>)[s] ?? s;
  }

  loadAudit(): void {
    this.api.getAuditTrail().subscribe(trail => this.auditTrail.set(trail));
  }

  approve(req: ParticipationResponseDTO): void {
    this.addProcessing(req.id);
    this.api.approve(req.id).subscribe({
      next: (updated) => { this.toast.showSuccess('Participation approuvée avec succès'); this.requests.update(list => list.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r)); this.removeProcessing(req.id); },
      error: () => this.removeProcessing(req.id),
    });
  }

  reject(req: ParticipationResponseDTO): void {
    this.addProcessing(req.id);
    this.api.reject(req.id).subscribe({
      next: () => { this.requests.update(list => list.map(r => r.id === req.id ? { ...r, status: 'REJECTED' } : r)); this.removeProcessing(req.id); },
      error: () => this.removeProcessing(req.id),
    });
  }

  private addProcessing(id: number): void {
    this.processing.update(s => { const n = new Set(s); n.add(id); return n; });
  }

  private removeProcessing(id: number): void {
    this.processing.update(s => { const n = new Set(s); n.delete(id); return n; });
  }
}

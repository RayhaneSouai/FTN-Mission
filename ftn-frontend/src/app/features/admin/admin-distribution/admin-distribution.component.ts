import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminCompetitionApiService } from '../admin-competitions/admin-competition-api.service';
import {
  DistributionResponse,
  DistributionStatus,
  Competition,
  CATEGORIE_LABELS,
} from '../../competitions/models/competition.model';

@Component({
  selector: 'app-admin-distribution',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="distribution-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <a routerLink="/admin/competitions" class="back-link">← Retour aux compétitions</a>
          <h2>Répartition des Participants</h2>
          <p class="subtitle">
            @if (competition()) {
              {{ competition()!.name }}
            }
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-bar">
        @if (!isApproved() && !distribution()) {
          <button class="btn-generate" (click)="generate()" [disabled]="loading()">
            @if (loading()) {
              <span class="btn-spinner"></span>
            }
            Générer la répartition
          </button>
        }
        @if (isGenerated()) {
          <button class="btn-approve" (click)="approve()" [disabled]="loading()">
            Approuver la répartition
          </button>
        }
        @if (isApproved()) {
          <span class="approval-badge">✓ Répartition approuvée</span>
        }
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }

      <!-- Loading -->
      @if (loading() && !distribution()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      }

      <!-- No distribution -->
      @if (!loading() && !distribution()) {
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>Aucune répartition générée. Cliquez sur "Générer la répartition" pour distribuer les nageurs approuvés dans les séries.</p>
        </div>
      }

      <!-- Distribution Series -->
      @if (distribution()) {
        <div class="distribution-info">
          <span class="info-item">
            <strong>Statut :</strong>
            <span class="status-badge" [class]="distribution()!.status.toLowerCase()">
              {{ distribution()!.status === 'APPROVED' ? 'Approuvée' : 'En attente d\\'approbation' }}
            </span>
          </span>
          @if (distribution()!.generatedAt) {
            <span class="info-item">
              <strong>Générée le :</strong> {{ distribution()!.generatedAt | date:'dd/MM/yyyy HH:mm' }}
            </span>
          }
          @if (distribution()!.approvedAt) {
            <span class="info-item">
              <strong>Approuvée le :</strong> {{ distribution()!.approvedAt | date:'dd/MM/yyyy HH:mm' }}
            </span>
          }
        </div>

        <div class="series-grid">
          @for (series of distribution()!.series; track series.seriesId) {
            <div class="series-card">
              <div class="series-header">
                <div class="series-title">
                  <h4>{{ series.seriesLabel }}</h4>
                  @if (series.swimmerCategory) {
                    <span class="category-badge">{{ getCategoryLabel(series.swimmerCategory) }}</span>
                  }
                </div>
                <div class="series-meta">
                  @if (series.time) {
                    <span class="meta-item">🕐 {{ series.time }}</span>
                  }
                  <span class="meta-item capacity">{{ series.participants.length }}/{{ series.capacity }}</span>
                </div>
              </div>
              <table class="series-table">
                <thead>
                  <tr>
                    <th>Pos.</th>
                    <th>Nageur</th>
                    <th>Meilleur temps</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of series.participants; track p.swimmerId) {
                    <tr>
                      <td class="pos-cell">{{ p.position }}</td>
                      <td class="name-cell">{{ p.swimmerFirstName }} {{ p.swimmerLastName }}</td>
                      <td class="time-cell">{{ formatTime(p.bestTime) }}</td>
                    </tr>
                  }
                  @if (series.participants.length === 0) {
                    <tr>
                      <td colspan="3" class="empty-row">Aucun nageur assigné</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .distribution-page { padding: 1.5rem; }

    .page-header { margin-bottom: 1.5rem; }
    .back-link {
      font-size: 0.8rem; color: #1565C0; text-decoration: none; font-weight: 500;
      &:hover { text-decoration: underline; }
    }
    h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; margin: 0.5rem 0 0.25rem; }
    .subtitle { color: #6c757d; font-size: 0.85rem; margin: 0; }

    .actions-bar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 1.5rem;
    }

    .btn-generate {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: #1565C0; color: white; border: none;
      border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      &:hover:not(:disabled) { background: #0d47a1; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-approve {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: #059669; color: white; border: none;
      border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      &:hover:not(:disabled) { background: #047857; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-spinner {
      width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    .approval-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 8px 14px; background: #d1fae5; color: #065f46;
      border-radius: 8px; font-size: 0.85rem; font-weight: 600;
    }

    .error-message {
      padding: 10px 16px; background: #fef2f2; color: #991b1b;
      border: 1px solid #fecaca; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem;
    }

    .loading-container {
      display: flex; flex-direction: column; align-items: center; padding: 48px; color: #6b7280;
      p { font-size: 14px; margin: 16px 0 0; }
    }

    .spinner {
      width: 36px; height: 36px; border: 3px solid #e5e7eb;
      border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; background: #f8fafc; border: 2px dashed #e5e7eb;
      border-radius: 12px; text-align: center;
      svg { color: #d1d5db; margin-bottom: 16px; }
      p { font-size: 0.85rem; color: #6b7280; margin: 0; max-width: 400px; }
    }

    .distribution-info {
      display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
      padding: 12px 16px; background: #f8fafc; border: 1px solid #e5e7eb;
      border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.82rem;
    }

    .info-item {
      display: inline-flex; align-items: center; gap: 6px; color: #374151;
      strong { color: #1f2937; }
    }

    .status-badge {
      padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;
      &.approved { background: #d1fae5; color: #065f46; }
      &.generated { background: #fef3c7; color: #92400e; }
    }

    .series-grid {
      display: flex; flex-direction: column; gap: 16px;
    }

    .series-card {
      border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
      &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    }

    .series-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid #e5e7eb;
    }

    .series-title {
      display: flex; align-items: center; gap: 10px;
      h4 { font-size: 0.9rem; font-weight: 700; color: #1f2937; margin: 0; }
    }

    .category-badge {
      padding: 2px 8px; background: #e0e7ff; color: #3730a3;
      font-size: 0.7rem; font-weight: 700; border-radius: 4px; text-transform: uppercase;
    }

    .series-meta {
      display: flex; align-items: center; gap: 12px; font-size: 0.78rem; color: #6b7280;
    }

    .meta-item.capacity {
      background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-weight: 600;
    }

    .series-table {
      width: 100%; border-collapse: collapse;
      th, td { padding: 10px 20px; text-align: left; font-size: 0.82rem; }
      th { background: white; font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.04em; border-bottom: 1px solid #f3f4f6; }
      td { border-bottom: 1px solid #f9fafb; color: #374151; }
      tr:last-child td { border-bottom: none; }
    }

    .pos-cell { font-weight: 700; color: #1565C0; width: 60px; }
    .name-cell { font-weight: 600; color: #1a1a2e; }
    .time-cell { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #6b7280; }
    .empty-row { text-align: center; color: #9ca3af; font-style: italic; }
  `]
})
export class AdminDistributionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminCompetitionApiService);

  competition = signal<Competition | null>(null);
  distribution = signal<DistributionResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  isGenerated = computed(() => this.distribution()?.status === DistributionStatus.GENERATED);
  isApproved = computed(() => this.distribution()?.status === DistributionStatus.APPROVED);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCompetition(id);
      this.loadDistribution(id);
    }
  }

  private loadCompetition(id: number): void {
    this.adminApi.getById(id).subscribe({
      next: (comp) => this.competition.set(comp),
      error: () => {}
    });
  }

  private loadDistribution(id: number): void {
    this.loading.set(true);
    this.adminApi.getDistribution(id).subscribe({
      next: (data) => {
        this.distribution.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  generate(): void {
    const comp = this.competition();
    if (!comp) return;

    this.loading.set(true);
    this.error.set(null);
    this.adminApi.generateDistribution(comp.id).subscribe({
      next: (data) => {
        this.distribution.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.error || 'Erreur lors de la génération.');
        this.loading.set(false);
      }
    });
  }

  approve(): void {
    const comp = this.competition();
    if (!comp) return;

    this.loading.set(true);
    this.error.set(null);
    this.adminApi.approveDistribution(comp.id).subscribe({
      next: (data) => {
        this.distribution.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.error || 'Erreur lors de l\'approbation.');
        this.loading.set(false);
      }
    });
  }

  formatTime(time: number | null): string {
    if (time == null) return 'NT';
    if (time >= 60) {
      const min = Math.floor(time / 60);
      const sec = (time % 60).toFixed(2);
      return `${min}:${sec.padStart(5, '0')}`;
    }
    return `${time.toFixed(2)}s`;
  }

  getCategoryLabel(cat: string): string {
    return (CATEGORIE_LABELS as Record<string, string>)[cat] ?? cat;
  }
}

import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionStateService } from '../../../services/competition-state.service';
import { CompetitionApiService } from '../../../services/competition-api.service';
import { AdminCompetitionApiService } from '../../../../admin/admin-competitions/admin-competition-api.service';
import { ParticipationResponseDTO, DistributionResponse, DistributionStatus } from '../../../models/competition.model';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantsComponent implements OnInit {
  private readonly state = inject(CompetitionStateService);
  private readonly competitionApi = inject(CompetitionApiService);
  private readonly adminApi = inject(AdminCompetitionApiService);

  participants = signal<ParticipationResponseDTO[]>([]);
  filteredParticipants = signal<ParticipationResponseDTO[]>([]);
  loading = signal(false);
  searchTerm = '';

  // Distribution state
  distribution = signal<DistributionResponse | null>(null);
  distributionLoading = signal(false);
  distributionError = signal<string | null>(null);
  activeView = signal<'list' | 'distribution'>('list');

  isAdmin = computed(() => {
    try {
      return sessionStorage.getItem('isAdmin') === 'true';
    } catch {
      return false;
    }
  });

  isDistributionGenerated = computed(() =>
    this.distribution()?.status === DistributionStatus.GENERATED
  );

  isDistributionApproved = computed(() =>
    this.distribution()?.status === DistributionStatus.APPROVED
  );

  ngOnInit(): void {
    const comp = this.state.selectedCompetition();
    if (comp) {
      if (this.isAdmin()) {
        this.loadParticipants(comp.id);
      }
      this.loadDistribution(comp.id);
    }
  }

  private loadParticipants(competitionId: number): void {
    this.loading.set(true);
    this.competitionApi.getApprovedParticipants(competitionId).subscribe({
      next: (data) => {
        this.participants.set(data);
        this.filteredParticipants.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadDistribution(competitionId: number): void {
    if (this.isAdmin()) {
      this.adminApi.getDistribution(competitionId).subscribe({
        next: (data) => this.distribution.set(data),
        error: () => {}
      });
    } else {
      this.competitionApi.getApprovedDistribution(competitionId).subscribe({
        next: (data) => this.distribution.set(data),
        error: () => {}
      });
    }
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredParticipants.set(this.participants());
      return;
    }
    this.filteredParticipants.set(
      this.participants().filter(
        (p) =>
          p.swimmerFirstName?.toLowerCase().includes(term) ||
          p.swimmerLastName?.toLowerCase().includes(term)
      )
    );
  }

  switchView(view: 'list' | 'distribution'): void {
    this.activeView.set(view);
  }

  generateDistribution(): void {
    const comp = this.state.selectedCompetition();
    if (!comp) return;

    this.distributionLoading.set(true);
    this.distributionError.set(null);

    this.adminApi.generateDistribution(comp.id).subscribe({
      next: (data) => {
        this.distribution.set(data);
        this.distributionLoading.set(false);
        this.activeView.set('distribution');
      },
      error: (err) => {
        this.distributionError.set(
          err?.error?.message || err?.error || 'Erreur lors de la génération de la répartition.'
        );
        this.distributionLoading.set(false);
      }
    });
  }

  approveDistribution(): void {
    const comp = this.state.selectedCompetition();
    if (!comp) return;

    this.distributionLoading.set(true);
    this.distributionError.set(null);

    this.adminApi.approveDistribution(comp.id).subscribe({
      next: (data) => {
        this.distribution.set(data);
        this.distributionLoading.set(false);
      },
      error: (err) => {
        this.distributionError.set(
          err?.error?.message || err?.error || 'Erreur lors de l\'approbation.'
        );
        this.distributionLoading.set(false);
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
}

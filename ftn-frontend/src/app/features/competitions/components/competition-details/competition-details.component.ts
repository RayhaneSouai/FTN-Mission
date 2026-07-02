import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CompetitionStateService } from '../../services/competition-state.service';
import { CompetitionApiService } from '../../services/competition-api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-competition-details',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './competition-details.component.html',
  styleUrl: './competition-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CompetitionApiService);
  private readonly toast = inject(ToastService);
  protected readonly state = inject(CompetitionStateService);

  readonly isAdmin = computed(() => typeof localStorage !== 'undefined' && localStorage.getItem('isAdmin') === 'true');
  readonly archiving = signal(false);
  readonly showArchiveConfirm = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.state.loadCompetitionById(id);
    }
  }

  ngOnDestroy(): void {
    this.state.clearSelectedCompetition();
  }

  confirmArchive(): void {
    this.showArchiveConfirm.set(true);
  }

  cancelArchive(): void {
    this.showArchiveConfirm.set(false);
  }

  doArchive(): void {
    const comp = this.state.selectedCompetition();
    if (!comp) return;
    this.archiving.set(true);
    this.showArchiveConfirm.set(false);
    this.api.archiveCompetition(comp.id).subscribe({
      next: (updated) => {
        this.archiving.set(false);
        this.toast.showSuccess('Compétition archivée avec succès');
        // Reflect archive state immediately
        this.state.loadCompetitionById(comp.id);
      },
      error: () => {
        this.archiving.set(false);
        this.toast.showError('Erreur lors de l\'archivage');
      }
    });
  }
}

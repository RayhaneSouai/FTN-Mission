import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionStateService } from '../../../services/competition-state.service';
import { ProgrammeApiService } from '../../../services/programme-api.service';
import { SeriesParticipant } from '../../../models/competition.model';

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
  private readonly programmeApi = inject(ProgrammeApiService);

  participants = signal<SeriesParticipant[]>([]);
  filteredParticipants = signal<SeriesParticipant[]>([]);
  loading = signal(false);
  searchTerm = '';

  ngOnInit(): void {
    const comp = this.state.selectedCompetition();
    if (comp) {
      this.loadParticipants(comp.id);
    }
  }

  private loadParticipants(competitionId: number): void {
    this.loading.set(true);
    this.programmeApi.getParticipants(competitionId).subscribe({
      next: (data) => {
        this.participants.set(data);
        this.filteredParticipants.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
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
          p.swimmerLastName?.toLowerCase().includes(term) ||
          p.club?.toLowerCase().includes(term)
      )
    );
  }
}

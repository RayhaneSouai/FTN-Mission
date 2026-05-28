import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgrammeApiService } from '../../../services/programme-api.service';
import { CompetitionStateService } from '../../../services/competition-state.service';
import { ProgrammeStatusResponse, ProgrammeDayResponse } from '../../../models/competition.model';

@Component({
  selector: 'app-programme-readonly',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './programme-readonly.component.html',
  styleUrls: ['./programme-readonly.component.scss']
})
export class ProgrammeReadonlyComponent implements OnInit {
  private readonly state = inject(CompetitionStateService);
  private readonly api = inject(ProgrammeApiService);

  status = signal<ProgrammeStatusResponse | null>(null);
  loading = signal(false);
  selectedDayId = signal<number | null>(null);

  programGenerated = computed(() => this.status()?.programGenerated ?? false);
  days = computed(() => this.status()?.days ?? []);

  selectedDay = computed(() => {
    const id = this.selectedDayId();
    return this.days().find(d => d.id === id) ?? null;
  });

  ngOnInit(): void {
    const comp = this.state.selectedCompetition();
    if (comp) {
      this.loadApprovedProgramme(comp.id);
    }
  }

  private loadApprovedProgramme(competitionId: number): void {
    this.loading.set(true);
    this.api.getApprovedProgramme(competitionId).subscribe({
      next: (res) => {
        this.status.set(res);
        this.loading.set(false);
        if (res.days.length > 0) {
          this.selectedDayId.set(res.days[0].id);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  selectDay(day: ProgrammeDayResponse): void {
    this.selectedDayId.set(day.id);
  }
}

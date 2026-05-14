import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CompetitionStateService } from '../../../services/competition-state.service';
import { DISCIPLINE_LABELS, REGION_LABELS, PISCINE_LABELS } from '../../../models/competition.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  protected readonly state = inject(CompetitionStateService);

  disciplineLabel(d: string): string {
    return (DISCIPLINE_LABELS as Record<string, string>)[d] ?? d;
  }

  regionLabel(r: string): string {
    return (REGION_LABELS as Record<string, string>)[r] ?? r;
  }

  piscineLabel(p: string): string {
    return (PISCINE_LABELS as Record<string, string>)[p] ?? p;
  }
}

import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CompetitionStateService } from '../../services/competition-state.service';

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
  protected readonly state = inject(CompetitionStateService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.state.loadCompetitionById(id);
    }
  }

  ngOnDestroy(): void {
    this.state.clearSelectedCompetition();
  }
}

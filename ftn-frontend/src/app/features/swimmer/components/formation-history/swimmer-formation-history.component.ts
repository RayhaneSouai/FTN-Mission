import { Component, OnInit } from '@angular/core';
import { FormationRegistration } from '../../../formation/models/formation.model';
import { FormationProgramService } from '../../../formation/services/formation-program.service';

@Component({
  selector: 'app-swimmer-formation-history',
  templateUrl: './swimmer-formation-history.component.html',
  styleUrl: '../formations/swimmer-formations.component.css'
})
export class SwimmerFormationHistoryComponent implements OnInit {
  history: FormationRegistration[] = [];
  loading = true;
  errorMessage = '';

  constructor(private formationService: FormationProgramService) {}

  ngOnInit(): void {
    this.formationService.getMyHistory().subscribe({
      next: (history) => {
        this.history = history;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load your training history.';
        this.loading = false;
      }
    });
  }

  formatDate(value?: string): string {
    if (!value) return 'To be confirmed';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }
}

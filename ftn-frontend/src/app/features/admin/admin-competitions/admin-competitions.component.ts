import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Competition, DISCIPLINE_LABELS } from '../../competitions/models/competition.model';
import { CompetitionApiService } from '../../competitions/services/competition-api.service';

@Component({
  selector: 'app-admin-competitions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-competitions">
      <h2>Gestion des Programmes</h2>
      <p class="subtitle">Gérez les programmes des compétitions (générer, modifier, approuver).</p>

      <div class="comp-table-wrap">
        <table class="comp-table">
          <thead>
            <tr>
              <th>Compétition</th>
              <th>Discipline</th>
              <th>Dates</th>
              <th>Statut programme</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (comp of competitions(); track comp.id) {
              <tr>
                <td class="name-cell">{{ comp.name }}</td>
                <td>{{ disciplineLabel(comp.discipline) }}</td>
                <td>{{ comp.startDate | date:'dd/MM/yyyy' }} - {{ comp.endDate | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [class.draft]="comp.programmeStatus === 'DRAFT'" [class.approved]="comp.programmeStatus === 'APPROVED'" [class.none]="!comp.programmeStatus">
                    {{ comp.programmeStatus === 'APPROVED' ? 'Approuvé' : comp.programmeStatus === 'DRAFT' ? 'Brouillon' : 'Non généré' }}
                  </span>
                </td>
                <td>
                  <a [routerLink]="['/admin/competitions', comp.id, 'programme']" class="btn-manage">
                    Gérer le programme
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-competitions { padding: 1.5rem; }
    h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.25rem; }
    .subtitle { color: #6c757d; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .comp-table-wrap { overflow-x: auto; }
    .comp-table {
      width: 100%; border-collapse: collapse; font-size: 0.85rem;
      th, td { padding: 0.65rem 0.75rem; text-align: left; border-bottom: 1px solid #e9ecef; }
      th { background: #f8f9fa; font-weight: 600; color: #495057; }
    }
    .name-cell { font-weight: 600; }
    .badge {
      padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;
      &.draft { background: #fff3cd; color: #856404; }
      &.approved { background: #d1e7dd; color: #0f5132; }
      &.none { background: #e9ecef; color: #6c757d; }
    }
    .btn-manage {
      padding: 0.35rem 0.7rem; background: #1565C0; color: white; border-radius: 6px;
      text-decoration: none; font-size: 0.8rem; font-weight: 600;
      &:hover { background: #0d47a1; }
    }
  `]
})
export class AdminCompetitionsComponent implements OnInit {
  private readonly api = inject(CompetitionApiService);
  competitions = signal<Competition[]>([]);

  disciplineLabel(d: string): string { return (DISCIPLINE_LABELS as Record<string, string>)[d] ?? d; }

  ngOnInit(): void {
    this.api.getAll().subscribe(comps => this.competitions.set(comps));
  }
}

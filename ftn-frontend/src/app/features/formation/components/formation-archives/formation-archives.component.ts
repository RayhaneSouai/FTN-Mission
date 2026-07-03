import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormationProgram, Season } from '../../models/formation.model';
import { FormationProgramService } from '../../services/formation-program.service';
import { SeasonService } from '../../services/season.service';

@Component({
  selector: 'app-formation-archives',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './formation-archives.component.html',
  styleUrl: './formation-archives.component.css'
})
export class FormationArchivesComponent implements OnInit {
  archivedSeasons: Season[] = [];
  loadingSeasons = true;
  expandedSeasonIds = new Set<number>();
  programsBySeason = new Map<number, FormationProgram[]>();
  loadingSeasonId: number | null = null;

  constructor(
    private seasonService: SeasonService,
    private programService: FormationProgramService
  ) {}

  ngOnInit(): void {
    this.loadSeasons();
  }

  loadSeasons(): void {
    this.loadingSeasons = true;
    this.seasonService.getAll().subscribe({
      next: (seasons) => {
        this.archivedSeasons = seasons.filter((season) => !season.active);
        this.loadingSeasons = false;
      },
      error: () => {
        this.loadingSeasons = false;
      }
    });
  }

  isExpanded(seasonId?: number): boolean {
    return !!seasonId && this.expandedSeasonIds.has(seasonId);
  }

  toggleSeason(season: Season): void {
    if (!season.id) {
      return;
    }

    if (this.expandedSeasonIds.has(season.id)) {
      this.expandedSeasonIds.delete(season.id);
      return;
    }

    this.expandedSeasonIds.add(season.id);

    if (this.programsBySeason.has(season.id)) {
      return;
    }

    this.loadingSeasonId = season.id;
    this.programService.getCoachPrograms(season.id).subscribe({
      next: (programs) => {
        this.programsBySeason.set(
          season.id!,
          programs.filter((program) => program.status === 'PUBLISHED')
        );
        this.loadingSeasonId = null;
      },
      error: () => {
        this.programsBySeason.set(season.id!, []);
        this.loadingSeasonId = null;
      }
    });
  }

  programsFor(seasonId?: number): FormationProgram[] {
    if (!seasonId) {
      return [];
    }
    return this.programsBySeason.get(seasonId) ?? [];
  }

  resolveLocation(program: FormationProgram): string {
    return program.theoreticalLocation || program.registrationLocation || program.instituteAddress || '';
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return 'Dates à confirmer';
    if (start && end) return `${this.formatDate(start)} – ${this.formatDate(end)}`;
    return this.formatDate(start || end);
  }

  private formatDate(value?: string): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(value));
  }
}

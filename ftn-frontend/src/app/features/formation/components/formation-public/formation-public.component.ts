import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormationProgram, Season } from '../../models/formation.model';
import { FormationProgramService } from '../../services/formation-program.service';
import { SeasonService } from '../../services/season.service';

@Component({
  selector: 'app-formation-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formation-public.component.html',
  styleUrl: './formation-public.component.css'
})
export class FormationPublicComponent implements OnInit {
  seasons: Season[] = [];
  selectedSeason: Season | null = null;
  programs: FormationProgram[] = [];
  loadingSeasons = true;
  loadingPrograms = false;

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
        this.seasons = seasons;
        this.loadingSeasons = false;
        const current = seasons.find((season) => season.active) ?? seasons[0] ?? null;
        if (current) {
          this.selectSeason(current);
        }
      },
      error: () => {
        this.loadingSeasons = false;
      }
    });
  }

  selectSeason(season: Season): void {
    this.selectedSeason = season;
    if (!season.id) {
      this.programs = [];
      return;
    }

    this.loadingPrograms = true;
    this.programService.getBySeason(season.id).subscribe({
      next: (programs) => {
        this.programs = programs.filter((program) => program.status === 'PUBLISHED');
        this.loadingPrograms = false;
      },
      error: () => {
        this.programs = [];
        this.loadingPrograms = false;
      }
    });
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return 'Dates à confirmer';
    if (start && end) return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    return this.formatDate(start || end);
  }

  private formatDate(value?: string): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }
}

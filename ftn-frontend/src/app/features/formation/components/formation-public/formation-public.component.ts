import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormationProgram, Season } from '../../models/formation.model';
import { FormationProgramService } from '../../services/formation-program.service';
import { SeasonService } from '../../services/season.service';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero.component';
import { PAGE_HERO_IMAGES } from '../../../../shared/components/page-hero/page-hero.constants';

@Component({
  selector: 'app-formation-public',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent],
  templateUrl: './formation-public.component.html',
  styleUrl: './formation-public.component.css'
})
export class FormationPublicComponent implements OnInit {
  readonly heroImage = PAGE_HERO_IMAGES.formation;

  currentSeason: Season | null = null;
  currentPrograms: FormationProgram[] = [];
  loadingSeasons = true;
  loadingCurrentPrograms = false;

  constructor(
    private seasonService: SeasonService,
    private programService: FormationProgramService
  ) {}

  ngOnInit(): void {
    this.loadSeasons();
  }

  loadSeasons(): void {
    this.loadingSeasons = true;
    this.seasonService.getActive().subscribe({
      next: (season) => {
        this.currentSeason = season;
        this.loadingSeasons = false;

        if (this.currentSeason) {
          this.loadCurrentPrograms(this.currentSeason);
        } else {
          this.currentPrograms = [];
        }
      },
      error: () => {
        this.loadingSeasons = false;
      }
    });
  }

  loadCurrentPrograms(season: Season): void {
    if (!season.id) {
      this.currentPrograms = [];
      return;
    }

    this.loadingCurrentPrograms = true;
    this.programService.getCoachPrograms(season.id).subscribe({
      next: (programs) => {
        this.currentPrograms = programs.filter(
          (program) => program.status === 'PUBLISHED' && program.programType === 'COACH_CERTIFICATION'
        );
        this.loadingCurrentPrograms = false;
      },
      error: () => {
        this.currentPrograms = [];
        this.loadingCurrentPrograms = false;
      }
    });
  }

  resolveProgramState(program: FormationProgram): 'OPEN' | 'UPCOMING' | 'CLOSED' | 'ARCHIVED' {
    if (!this.currentSeason?.active || this.isPastFormation(program)) {
      return 'ARCHIVED';
    }
    const today = this.startOfDay(new Date());
    const start = program.registrationStartDate ? this.startOfDay(new Date(program.registrationStartDate)) : null;
    if (start && start > today) {
      return 'UPCOMING';
    }
    const end = program.registrationEndDate ? this.startOfDay(new Date(program.registrationEndDate)) : null;
    if (end && end < today) {
      return 'CLOSED';
    }
    return 'OPEN';
  }

  resolveProgramStateLabel(program: FormationProgram): string {
    const labels: Record<string, string> = {
      OPEN: 'Ouverte',
      UPCOMING: 'À venir',
      CLOSED: 'Fermée',
      ARCHIVED: 'Archivée'
    };
    return labels[this.resolveProgramState(program)];
  }

  resolveLocation(program: FormationProgram): string {
    return program.theoreticalLocation || program.registrationLocation || program.instituteAddress || '';
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return 'Dates à confirmer';
    if (start && end) return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    return this.formatDate(start || end);
  }

  private isPastFormation(program: FormationProgram): boolean {
    const today = this.startOfDay(new Date());
    const endValue = program.practicalPeriodEnd || program.theoreticalEndDate;
    const formationEnd = endValue ? this.startOfDay(new Date(endValue)) : null;
    return !!formationEnd && formationEnd < today;
  }

  private formatDate(value?: string): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}

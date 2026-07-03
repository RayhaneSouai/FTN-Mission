import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormationProgram, Season, TargetCategory } from '../../models/formation.model';
import { FormationProgramService } from '../../services/formation-program.service';
import { SeasonService } from '../../services/season.service';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero.component';
import { PAGE_HERO_IMAGES } from '../../../../shared/components/page-hero/page-hero.constants';
import { programStateLabel, resolveProgramState } from '../../utils/formation-registration.util';

type CategoryFilter = TargetCategory | 'ALL';

@Component({
  selector: 'app-swimmer-program-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeroComponent],
  templateUrl: './swimmer-program-list.component.html',
  styleUrl: './swimmer-program-list.component.css'
})
export class SwimmerProgramListComponent implements OnInit {
  readonly heroImage = PAGE_HERO_IMAGES.formation;
  readonly allCategories: TargetCategory[] = ['AVENIRS', 'BENJAMINS', 'MINIMES', 'CADETS', 'JUNIORS', 'SENIORS'];

  currentSeason: Season | null = null;
  programs: FormationProgram[] = [];
  loadingSeasons = true;
  loadingPrograms = false;
  categoryFilter: CategoryFilter = 'ALL';

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
          this.loadPrograms(this.currentSeason);
        } else {
          this.programs = [];
        }
      },
      error: () => {
        this.loadingSeasons = false;
      }
    });
  }

  loadPrograms(season: Season): void {
    if (!season.id) {
      this.programs = [];
      return;
    }
    this.loadingPrograms = true;
    this.programService.getSwimmerPrograms(season.id).subscribe({
      next: (programs) => {
        this.programs = programs.filter(
          (p) => p.status === 'PUBLISHED' && p.programType === 'SWIMMER_TRAINING'
        );
        this.loadingPrograms = false;
      },
      error: () => {
        this.programs = [];
        this.loadingPrograms = false;
      }
    });
  }

  onCategoryChange(value: string): void {
    this.categoryFilter = value === 'ALL' ? 'ALL' : (value as TargetCategory);
  }

  categoryLabel(category: TargetCategory): string {
    const labels: Record<TargetCategory, string> = {
      AVENIRS: 'Avenirs',
      BENJAMINS: 'Benjamins',
      MINIMES: 'Minimes',
      CADETS: 'Cadets',
      JUNIORS: 'Juniors',
      SENIORS: 'Seniors'
    };
    return labels[category];
  }

  get filteredPrograms(): FormationProgram[] {
    if (this.categoryFilter === 'ALL') {
      return this.programs;
    }
    return this.programs.filter((p) => p.targetCategory === this.categoryFilter);
  }

  spotsRemaining(program: FormationProgram): number | null {
    if (program.maxParticipants == null) return null;
    return Math.max(0, program.maxParticipants - (program.registeredCount ?? 0));
  }

  coachName(program: FormationProgram): string {
    if (!program.coach) return 'Non assigné';
    return `${program.coach.firstName ?? ''} ${program.coach.lastName ?? ''}`.trim() || 'Non assigné';
  }

  resolveProgramState(program: FormationProgram) {
    return resolveProgramState(program, this.currentSeason?.active);
  }

  resolveProgramStateLabel(program: FormationProgram): string {
    return programStateLabel(this.resolveProgramState(program));
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return 'Dates à confirmer';
    if (start && end) return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    return this.formatDate(start || end);
  }

  private formatDate(value?: string): string {
    if (!value) return '';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompetitionApiService } from '../../services/competition-api.service';
import { Competition, Discipline } from '../../models/competition.model';

@Component({
  selector: 'app-competition-archive',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './competition-archive.component.html',
  styleUrl: './competition-archive.component.scss',
})
export class CompetitionArchiveComponent implements OnInit {
  private readonly api = inject(CompetitionApiService);

  readonly archives = signal<Competition[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly selectedYear = signal<number | null>(null);
  readonly selectedDiscipline = signal<string>('');

  readonly availableYears = computed(() => {
    const years = new Set<number>();
    for (const c of this.archives()) {
      if (c.startDate) {
        years.add(new Date(c.startDate).getFullYear());
      }
    }
    return Array.from(years).sort((a, b) => b - a);
  });

  readonly disciplines = Object.values(Discipline);

  readonly DISCIPLINE_LABELS: Record<string, string> = {
    NATATION: 'Natation',
    EAU_LIBRE: 'Eau Libre',
    WATER_POLO: 'Water-Polo',
    PLONGEON: 'Plongeon',
    NAGE_SYNCHRONISEE: 'Nage Synchronisée',
  };

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const year = this.selectedYear();
    const discipline = this.selectedDiscipline();

    return this.archives().filter(c => {
      const matchesSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        (c.lieu ?? '').toLowerCase().includes(term);
      const matchesYear = !year ||
        (c.startDate && new Date(c.startDate).getFullYear() === year);
      const matchesDiscipline = !discipline || c.discipline === discipline;
      return matchesSearch && matchesYear && matchesDiscipline;
    });
  });

  /** Archives grouped by year for display */
  readonly groupedByYear = computed(() => {
    const groups = new Map<number, Competition[]>();
    for (const c of this.filtered()) {
      const year = c.startDate ? new Date(c.startDate).getFullYear() : 0;
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(c);
    }
    // Sort each year's competitions by date descending (most recent first)
    for (const list of groups.values()) {
      list.sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return db - da;
      });
    }
    // Sort years descending
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  });

  ngOnInit(): void {
    this.api.getArchivedCompetitions().subscribe({
      next: (data) => {
        this.archives.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des archives');
        this.loading.set(false);
      }
    });
  }

  getDisciplineLabel(d: string): string {
    return this.DISCIPLINE_LABELS[d] ?? d;
  }

  formatDateRange(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return `${s.toLocaleDateString('fr-FR', opts)} — ${e.toLocaleDateString('fr-FR', opts)}`;
  }
}

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, DatePipe, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import {
  Competition,
  Discipline,
  DISCIPLINE_LABELS,
  PISCINE_LABELS,
  REGION_LABELS,
} from '../../models/competition.model';
import { CompetitionStateService } from '../../services/competition-state.service';
import { ToastContainerComponent } from '../toast-container/toast-container.component';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero.component';
import { PAGE_HERO_IMAGES } from '../../../../shared/components/page-hero/page-hero.constants';

type CalendarView = 'month' | 'week';

interface CalendarDay {
  isoDate: string;
  label: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
  events: WeekEvent[];
}

interface WeekEvent {
  competition: Competition;
  startCol: number;
  span: number;
  row: number;
}

@Component({
  selector: 'app-competition-list',
  standalone: true,
  imports: [DatePipe, NgStyle, ToastContainerComponent, PageHeroComponent],
  templateUrl: './competition-list.component.html',
  styleUrl: './competition-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionListComponent implements OnInit {
  readonly heroImage = PAGE_HERO_IMAGES.competitions;
  protected readonly state = inject(CompetitionStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  readonly currentView = signal<CalendarView>('month');

  /* ─── Date navigation ─── */
  readonly viewYear = signal(new Date().getFullYear());
  readonly viewMonth = signal(new Date().getMonth());
  readonly viewWeekStart = signal(this.getMonday(new Date()));
  readonly weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  private readonly todayIso = this.toIsoDate(new Date());

  readonly monthLabel = computed(() => {
    const d = new Date(this.viewYear(), this.viewMonth(), 1);
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d);
  });
  readonly weekLabel = computed(() => {
    const mon = this.viewWeekStart();
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    return `${fmt.format(mon)} — ${fmt.format(sun)}`;
  });

  /* ─── Computed calendar data ─── */
  readonly monthWeeks = computed<CalendarWeek[]>(() => {
    const comps = this.state.competitions();
    const days = this.generateMonthDays(this.viewYear(), this.viewMonth());
    const weeks: CalendarWeek[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const wd = days.slice(i, i + 7);
      weeks.push({ days: wd, events: this.computeWeekEvents(wd, comps) });
    }
    return weeks;
  });

  readonly currentWeekData = computed<CalendarWeek>(() => {
    const comps = this.state.competitions();
    const days = this.generateWeekDays(this.viewWeekStart());
    return { days, events: this.computeWeekEvents(days, comps) };
  });

  /* ─── Stats ─── */
  readonly uniqueRegions = computed(() =>
    [...new Set(this.state.competitions().map((c) => c.region).filter(Boolean))]
  );

  readonly thisMonthCount = computed(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    return this.state.competitions().filter((c) => {
      const d = new Date(c.startDate);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  });

  readonly upcomingCount = computed(() => {
    const today = this.todayIso;
    return this.state.competitions().filter((c) => c.startDate > today).length;
  });

  /* ─── Helpers ─── */
  disciplineLabel(d: Discipline): string { return DISCIPLINE_LABELS[d] ?? d; }
  piscineLabel(p: string): string { return (PISCINE_LABELS as Record<string, string>)[p] ?? p; }
  regionLabel(r: string): string { return (REGION_LABELS as Record<string, string>)[r] ?? r; }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.state.loadCompetitions();
    }
  }

  /* ─── View switching ─── */
  setView(v: CalendarView): void { this.currentView.set(v); }

  /* ─── Date navigation ─── */
  prevPeriod(): void {
    if (this.currentView() === 'month') {
      let m = this.viewMonth() - 1, y = this.viewYear();
      if (m < 0) { m = 11; y--; }
      this.viewMonth.set(m); this.viewYear.set(y);
    } else {
      const d = new Date(this.viewWeekStart()); d.setDate(d.getDate() - 7);
      this.viewWeekStart.set(d);
    }
  }
  nextPeriod(): void {
    if (this.currentView() === 'month') {
      let m = this.viewMonth() + 1, y = this.viewYear();
      if (m > 11) { m = 0; y++; }
      this.viewMonth.set(m); this.viewYear.set(y);
    } else {
      const d = new Date(this.viewWeekStart()); d.setDate(d.getDate() + 7);
      this.viewWeekStart.set(d);
    }
  }
  goToday(): void {
    const now = new Date();
    this.viewYear.set(now.getFullYear());
    this.viewMonth.set(now.getMonth());
    this.viewWeekStart.set(this.getMonday(now));
  }

  /* ─── Navigate to details ─── */
  navigateToDetails(comp: Competition): void {
    this.router.navigate(['/competitions', comp.id]);
  }

  /* ─── Event bar style (absolute positioning inside week row) ─── */
  eventBarStyle(ev: WeekEvent): Record<string, string> {
    const col = 100 / 7;
    return {
      left: `${(ev.startCol - 1) * col}%`,
      width: `${ev.span * col}%`,
      top: `${33 + ev.row * 30}px`,
    };
  }

  /* ═══ Internal ═══ */
  private computeWeekEvents(days: CalendarDay[], comps: Competition[]): WeekEvent[] {
    const wStart = days[0].isoDate, wEnd = days[6].isoDate;
    const events: WeekEvent[] = [];
    const occupied: boolean[][] = [];

    for (const comp of comps) {
      if (comp.endDate < wStart || comp.startDate > wEnd) continue;
      const es = comp.startDate < wStart ? wStart : comp.startDate;
      const ee = comp.endDate > wEnd ? wEnd : comp.endDate;
      const sc = days.findIndex((d) => d.isoDate === es) + 1;
      const ec = days.findIndex((d) => d.isoDate === ee) + 1;
      if (sc < 1 || ec < 1) continue;
      const span = ec - sc + 1;

      let row = 0;
      while (true) {
        if (!occupied[row]) occupied[row] = Array(7).fill(false);
        if (Array.from({ length: span }, (_, i) => sc - 1 + i).every((c) => !occupied[row][c])) break;
        row++;
      }
      if (!occupied[row]) occupied[row] = Array(7).fill(false);
      for (let i = 0; i < span; i++) occupied[row][sc - 1 + i] = true;

      events.push({ competition: comp, startCol: sc, span, row });
    }
    return events;
  }

  private generateMonthDays(year: number, month: number): CalendarDay[] {
    const f = new Date(year, month, 1);
    const off = (f.getDay() + 6) % 7;
    const gs = new Date(year, month, 1 - off);
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(gs); d.setDate(gs.getDate() + i);
      const iso = this.toIsoDate(d);
      return { isoDate: iso, label: d.getDate(), inCurrentMonth: d.getMonth() === month, isToday: iso === this.todayIso };
    });
  }

  private generateWeekDays(monday: Date): CalendarDay[] {
    const m = new Date().getMonth();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const iso = this.toIsoDate(d);
      return { isoDate: iso, label: d.getDate(), inCurrentMonth: d.getMonth() === m, isToday: iso === this.todayIso };
    });
  }

  private getMonday(date: Date): Date {
    const d = new Date(date); d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    d.setHours(0, 0, 0, 0); return d;
  }
  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
  }
}

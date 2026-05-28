import { Component, inject } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { UserService } from '../../features/users/services/user.service';
import { ChartDateRange, resolveChartDateRange } from '../models/chart-range.model';
import { buildInscriptionActivityChart } from '../utils/inscription-activity.builder';

interface ChartViewModel {
  series: ReturnType<typeof buildInscriptionActivityChart>;
  range: ChartDateRange;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-dashboard-activity',
  templateUrl: './dashboard-activity.component.html',
  styleUrls: ['./dashboard-activity.component.css']
})
export class DashboardActivityComponent {
  private readonly userService = inject(UserService);
  private readonly range$ = new BehaviorSubject<ChartDateRange>(resolveChartDateRange('7d'));
  private readonly refresh$ = new BehaviorSubject(0);

  private readonly users$ = this.refresh$.pipe(
    switchMap(() =>
      this.userService.getAllUsers().pipe(catchError(() => of([] as Record<string, unknown>[])))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly chartVm$ = combineLatest([this.users$, this.range$]).pipe(
    map(([users, range]) => ({
      series: buildInscriptionActivityChart(users, range),
      range,
      loading: false,
      error: null
    })),
    startWith({
      series: [],
      range: resolveChartDateRange('7d'),
      loading: true,
      error: null
    } as ChartViewModel)
  );

  onRangeChange(range: ChartDateRange): void {
    this.range$.next(range);
  }

  reload(): void {
    this.refresh$.next(this.refresh$.value + 1);
  }
}

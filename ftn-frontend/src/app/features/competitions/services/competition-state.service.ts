import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { Competition } from '../models/competition.model';
import { CompetitionApiService } from './competition-api.service';
import { ToastService } from './toast.service';

interface CompetitionState {
    items: Competition[];
    loading: boolean;
    error: string | null;
}

export interface NextCompetitionInfo {
    competition: Competition;
    daysUntil: number;
}

@Injectable({ providedIn: 'root' })
export class CompetitionStateService {
    private readonly api = inject(CompetitionApiService);
    private readonly toast = inject(ToastService);

    private readonly state = signal<CompetitionState>({
        items: [],
        loading: false,
        error: null,
    });

    /* ─── Selectors ─── */
    readonly competitions = computed(() =>
        [...this.state().items].sort((a, b) => a.startDate.localeCompare(b.startDate))
    );
    readonly isLoading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);

    /* ─── Pagination ─── */
    readonly pageSize = 3;
    readonly currentPage = signal(0);

    readonly paginatedCompetitions = computed(() => {
        const all = this.competitions();
        const start = this.currentPage() * this.pageSize;
        return all.slice(start, start + this.pageSize);
    });

    readonly totalPages = computed(() =>
        Math.max(1, Math.ceil(this.competitions().length / this.pageSize))
    );

    readonly canPrevPage = computed(() => this.currentPage() > 0);
    readonly canNextPage = computed(() => this.currentPage() < this.totalPages() - 1);

    /* ─── Next Nearest Competition ─── */
    readonly nextNearest = computed<NextCompetitionInfo | null>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        let closest: NextCompetitionInfo | null = null;

        for (const comp of this.competitions()) {
            const startMs = new Date(comp.startDate + 'T00:00:00').getTime();
            if (startMs > todayMs) {
                const daysUntil = Math.ceil((startMs - todayMs) / 86400000);
                if (!closest || daysUntil < closest.daysUntil) {
                    closest = { competition: comp, daysUntil };
                }
            }
        }
        return closest;
    });

    /* ─── Page navigation ─── */
    goToPage(page: number): void {
        this.currentPage.set(Math.max(0, Math.min(page, this.totalPages() - 1)));
    }
    nextPage(): void { this.goToPage(this.currentPage() + 1); }
    prevPage(): void { this.goToPage(this.currentPage() - 1); }

    /* ─── CRUD Actions ─── */

    loadCompetitions(): void {
        this.state.update((s) => ({ ...s, loading: true, error: null }));
        this.api.getAll().pipe(
            tap((items) => this.state.update((s) => ({ ...s, items }))),
            catchError((err) => {
                const msg = err?.message ?? 'Échec du chargement';
                this.state.update((s) => ({ ...s, error: msg }));
                this.toast.showError(msg);
                return of([]);
            }),
            finalize(() => this.state.update((s) => ({ ...s, loading: false })))
        ).subscribe();
    }

    /* ─── Single Competition (Details Page) ─── */
    private readonly _selectedCompetition = signal<Competition | null>(null);
    readonly selectedCompetition = this._selectedCompetition.asReadonly();

    private readonly _participationStatus = signal<'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE'>('NONE');
    readonly participationStatus = this._participationStatus.asReadonly();

    readonly hasProgramme = computed(() => {
        const comp = this._selectedCompetition();
        return comp?.programmeStatus === 'APPROVED';
    });

    loadCompetitionById(id: number): void {
        this.state.update((s) => ({ ...s, loading: true, error: null }));
        this._selectedCompetition.set(null);
        this._participationStatus.set('NONE');
        this.api.getById(id).pipe(
            tap((res) => {
                this._selectedCompetition.set(res.competition);
                this._participationStatus.set(res.participationStatus ?? 'NONE');
            }),
            catchError((err) => {
                const msg = err?.message ?? 'Échec du chargement de la compétition';
                this.state.update((s) => ({ ...s, error: msg }));
                this.toast.showError(msg);
                return of(null);
            }),
            finalize(() => this.state.update((s) => ({ ...s, loading: false })))
        ).subscribe();
    }

    updateParticipationStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE'): void {
        this._participationStatus.set(status);
    }

    clearSelectedCompetition(): void {
        this._selectedCompetition.set(null);
    }

    clearError(): void {
        this.state.update((s) => ({ ...s, error: null }));
    }
}

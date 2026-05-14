import { Routes } from '@angular/router';
import { competitionAccessGuard } from './guards/competition.guard';
import { CompetitionListComponent } from './components/competition-list/competition-list.component';

export const COMPETITION_ROUTES: Routes = [
    {
        path: '',
        canActivate: [competitionAccessGuard],
        children: [
            { path: '', component: CompetitionListComponent },
            {
                path: ':id',
                loadComponent: () =>
                    import('./components/competition-details/competition-details.component').then(
                        (m) => m.CompetitionDetailsComponent
                    ),
                children: [
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    {
                        path: 'overview',
                        loadComponent: () =>
                            import('./components/competition-details/overview/overview.component').then(
                                (m) => m.OverviewComponent
                            ),
                    },
                    {
                        path: 'participants',
                        loadComponent: () =>
                            import('./components/competition-details/participants/participants.component').then(
                                (m) => m.ParticipantsComponent
                            ),
                    },
                    {
                        path: 'resultat',
                        loadComponent: () =>
                            import('./components/competition-details/resultat/resultat.component').then(
                                (m) => m.ResultatComponent
                            ),
                    },
                ],
            },
        ],
    },
];

import { Routes } from '@angular/router';
import { competitionAccessGuard } from './guards/competition.guard';
import { CompetitionListComponent } from './components/competition-list/competition-list.component';

export const COMPETITION_ROUTES: Routes = [
    {
        path: '',
        canActivate: [competitionAccessGuard],
        children: [
            { path: '', component: CompetitionListComponent },
        ],
    },
];

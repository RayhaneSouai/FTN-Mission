import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ClubListComponent } from './features/clubs/components/club-list/club-list.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'clubs', component: ClubListComponent },
  {
    path: 'competitions',
    loadChildren: () =>
      import('./features/competitions/competition.routes').then(
        (m) => m.COMPETITION_ROUTES
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

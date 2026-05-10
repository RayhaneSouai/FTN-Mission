import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ClubListComponent } from './components/club-list/club-list.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'clubs', component: ClubListComponent },
  {
    path: 'competitions',
    loadChildren: () =>
      import('./competition/competition.routes').then(
        (m) => m.COMPETITION_ROUTES
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

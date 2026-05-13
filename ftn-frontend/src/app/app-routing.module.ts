import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ClubListComponent } from './features/clubs/components/club-list/club-list.component';
import { PublicLayoutComponent } from './layout/public/public-layout.component';

const routes: Routes = [
  // Main Layout Space (Includes Navbar/Footer)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'clubs', component: ClubListComponent },
      {
        path: 'competitions',
        loadChildren: () =>
          import('./features/competitions/competition.routes').then(
            (m) => m.COMPETITION_ROUTES
          ),
      },
      // Admin/Space management moved under the same layout
      {
        path: 'utilisateurs',
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'licences',
        loadChildren: () => import('./features/licenses/licenses.module').then(m => m.LicensesModule)
      },
      {
        path: 'mon-profil',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      }
    ]
  },

  // Auth Space (Clean interface, no Navbar/Footer)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ClubListComponent } from './features/clubs/components/club-list/club-list.component';
import { PublicLayoutComponent } from './layout/public/public-layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { adminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  // Admin Space (Backoffice)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: DashboardComponent },
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

  // Main Layout Space (Includes Navbar/Footer) - Frontoffice
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
      // Keep Mon Profil for everyone in Frontoffice too
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
  },
  
  // Wildcard redirect
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

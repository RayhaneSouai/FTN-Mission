import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ClubListComponent } from './features/clubs/components/club-list/club-list.component';
import { PublicLayoutComponent } from './layout/public/public-layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { adminGuard } from './core/guards/admin.guard';

import { MyPerformancesComponent } from './features/my-performance/my-performances.component';
import { RankingComponent } from './features/ranking/ranking.component';


  
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
      },
      {
        path: 'press',
        loadChildren: () => import('./features/press/press.module').then(m => m.PressModule)
      },
      {
        path: 'clubs',
        component: ClubListComponent,
        data: { clubMode: 'admin' }
      },
      {
        path: 'performances',
    component: MyPerformancesComponent
  },
  {
    path: 'ranking',
    component: RankingComponent
  },
  {
    path: '**',
    redirectTo: 'performances'
  }
    ]
  },
  {
    path: 'espace-nageur',
    loadChildren: () => import('./features/swimmer/swimmer.module').then(m => m.SwimmerModule)
  },

  // Main Layout Space (Includes Navbar/Footer) - Frontoffice
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'clubs', component: ClubListComponent, data: { clubMode: 'public' } },
      {
        path: 'competitions',
        loadChildren: () =>
          import('./features/competitions/competition.routes').then(
            (m) => m.COMPETITION_ROUTES
          ),
      },
      {
        path: 'mon-profil',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'press',
        loadChildren: () => import('./features/press/press.module').then(m => m.PressModule)
      }
    ]
  },

  // Auth Space (Clean interface, no Navbar/Footer)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Legacy paths (older links / login redirects from teammates)
  { path: 'utilisateurs', redirectTo: 'admin/utilisateurs', pathMatch: 'full' },
  { path: 'licences', redirectTo: 'admin/licences', pathMatch: 'full' },

  // Wildcard redirect
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{scrollPositionRestoration: 'top'})],
  exports: [RouterModule]
})
export class AppRoutingModule {}

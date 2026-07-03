import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public/public-layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { swimmerOrCoachGuard } from './core/guards/swimmer-or-coach.guard';
import { coachGuard } from './core/guards/coach.guard';
import { AdminCompetitionsComponent } from './features/admin/admin-competitions/admin-competitions.component';
import { AdminProgrammeComponent } from './features/admin/admin-programme/admin-programme.component';
import { AdminParticipationsComponent } from './features/admin/admin-participations/admin-participations.component';
import { AdminDistributionComponent } from './features/admin/admin-distribution/admin-distribution.component';
import { RankingComponent } from './features/ranking/ranking.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
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
      { path: 'competitions', component: AdminCompetitionsComponent },
      { path: 'competitions/:id/programme', component: AdminProgrammeComponent },
      { path: 'competitions/:id/distribution', component: AdminDistributionComponent },
      {
        path: 'competitions/archives',
        loadComponent: () =>
          import('./features/competitions/components/competition-archive/competition-archive.component').then(
            m => m.CompetitionArchiveComponent
          )
      },
      { path: 'participations', component: AdminParticipationsComponent },
      {
        path: 'clubs',
        loadComponent: () =>
          import('./features/clubs/components/club-list/club-list.component').then(m => m.ClubListComponent),
        data: { clubMode: 'admin' }
      },
      {
        path: 'formations',
        loadChildren: () =>
          import('./features/formation/formation.module').then((m) => m.FormationModule)
      },
      { path: 'ranking', component: RankingComponent },
      {
        path: 'performances',
        loadComponent: () =>
          import('./features/performances/performance-list/performance-list.component')
            .then(m => m.PerformanceListComponent),
      },
      {
        path: 'performances/new',
        loadComponent: () =>
          import('./features/performances/performance-form/performance-form.component').then(m => m.PerformanceFormComponent),
      },
      {
        path: 'partenariats',
        loadComponent: () =>
          import('./features/admin/partenariats/admin-partenariats.component')
            .then(m => m.AdminPartenariatsComponent)
      },
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [publicGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'partenaires',
        loadChildren: () => import('./features/partners/partners.module').then(m => m.PartnersModule)
      },
      {
        path: 'clubs',
        loadComponent: () =>
          import('./features/clubs/components/club-list/club-list.component').then(m => m.ClubListComponent),
        data: { clubMode: 'public' }
      },
      {
        path: 'clubs/:id',
        loadComponent: () =>
          import('./features/clubs/components/club-detail/club-detail.component').then(m => m.ClubDetailComponent)
      },
      {
        path: 'competitions',
        loadChildren: () =>
          import('./features/competitions/competition.routes').then(
            (m) => m.COMPETITION_ROUTES
          )
      },
      {
        path: 'mon-profil',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [authGuard]
      },
      {
        path: 'classement',
        loadComponent: () =>
          import('./features/ranking/ranking.component').then(m => m.RankingComponent),
      },
      {
        path: 'records',
        loadComponent: () =>
          import('./features/records/records.component').then(m => m.RecordsComponent),
      },
      {
        path: 'mes-performances',
        loadComponent: () =>
          import('./features/my-performance/my-performances.component').then(m => m.MyPerformancesComponent),
      },
      {
        path: 'formations/devenir-coach',
        loadComponent: () =>
          import('./features/formation/components/formation-public/formation-public.component')
            .then(m => m.FormationPublicComponent),
      },
      {
        path: 'formations/archives',
        loadComponent: () =>
          import('./features/formation/components/formation-archives/formation-archives.component')
            .then(m => m.FormationArchivesComponent),
      },
      {
        path: 'formations/programmes/:id',
        loadComponent: () =>
          import('./features/formation/components/swimmer-program-detail/swimmer-program-detail.component')
            .then(m => m.SwimmerProgramDetailComponent),
      },
      {
        path: 'formations/programmes',
        loadComponent: () =>
          import('./features/formation/components/swimmer-program-list/swimmer-program-list.component')
            .then(m => m.SwimmerProgramListComponent),
      },
      {
        path: 'formations/mes-formations',
        canActivate: [swimmerOrCoachGuard],
        loadComponent: () =>
          import('./features/swimmer/components/formations/swimmer-formations.component')
            .then(m => m.SwimmerFormationsComponent),
      },
      {
        path: 'formations/suivi-nageurs',
        canActivate: [coachGuard],
        loadComponent: () =>
          import('./features/formation/components/coach-swimmer-tracking/coach-swimmer-tracking.component')
            .then(m => m.CoachSwimmerTrackingComponent),
      },
      {
        path: 'formations/:id',
        loadComponent: () =>
          import('./features/formation/components/formation-detail/formation-detail.component')
            .then(m => m.FormationDetailComponent),
      },
      {
        path: 'formations',
        redirectTo: 'formations/devenir-coach',
        pathMatch: 'full'
      },
      {
        path: 'espace-nageur',
        loadChildren: () => import('./features/swimmer/swimmer.module').then(m => m.SwimmerModule)
      },
      {
        path: 'press',
        loadChildren: () => import('./features/press/press.module').then(m => m.PressModule)
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'licences',
        loadComponent: () => import('./features/licenses/license-info/license-info.component').then(m => m.LicenseInfoComponent)
      }
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'utilisateurs', redirectTo: 'admin/utilisateurs', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwimmerLayoutComponent } from './layout/swimmer-layout.component';
import { SwimmerDashboardComponent } from './components/dashboard/swimmer-dashboard.component';
import { SwimmerPerformancesComponent } from './components/performances/swimmer-performances.component';
import { SwimmerCompetitionsComponent } from './components/competitions/swimmer-competitions.component';
import { SwimmerActualitesComponent } from './components/actualites/swimmer-actualites.component';
import { SwimmerClubComponent } from './components/club/swimmer-club.component';
import { SwimmerFormationCertificatesComponent } from './components/formation-certificates/swimmer-formation-certificates.component';
import { SwimmerFormationHistoryComponent } from './components/formation-history/swimmer-formation-history.component';
import { SwimmerFormationsComponent } from './components/formations/swimmer-formations.component';

const routes: Routes = [
  {
    path: '',
    component: SwimmerLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SwimmerDashboardComponent },
      { path: 'performances', component: SwimmerPerformancesComponent },
      { path: 'competitions', component: SwimmerCompetitionsComponent },
      { path: 'formations', component: SwimmerFormationsComponent },
      { path: 'formations/historique', component: SwimmerFormationHistoryComponent },
      { path: 'formations/certificats', component: SwimmerFormationCertificatesComponent },
      { path: 'actualites', component: SwimmerActualitesComponent },
      { path: 'mon-club', component: SwimmerClubComponent },
      { 
        path: 'mon-profil', 
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule) 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwimmerRoutingModule {}

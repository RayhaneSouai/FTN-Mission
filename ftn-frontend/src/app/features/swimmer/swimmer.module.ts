import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SwimmerRoutingModule } from './swimmer-routing.module';
import { SwimmerLayoutComponent } from './layout/swimmer-layout.component';
import { SwimmerDashboardComponent } from './components/dashboard/swimmer-dashboard.component';
import { SwimmerPerformancesComponent } from './components/performances/swimmer-performances.component';
import { SwimmerCompetitionsComponent } from './components/competitions/swimmer-competitions.component';
import { SwimmerClubComponent } from './components/club/swimmer-club.component';
import { SwimmerFormationCertificatesComponent } from './components/formation-certificates/swimmer-formation-certificates.component';
import { SwimmerFormationHistoryComponent } from './components/formation-history/swimmer-formation-history.component';
import { SwimmerFormationsComponent } from './components/formations/swimmer-formations.component';
import { SwimmerActualitesComponent } from './components/actualites/swimmer-actualites.component';
import { NutritionComponent } from './components/nutrition/nutrition.component';
import { SharedModule } from '../../shared/shared.module';
import { PressVisitorModule } from '../press/press-visitor.module';

@NgModule({
  declarations: [
    SwimmerLayoutComponent,
    SwimmerDashboardComponent,
    SwimmerPerformancesComponent,
    SwimmerCompetitionsComponent,
    SwimmerActualitesComponent,
    SwimmerClubComponent,
    SwimmerFormationHistoryComponent,
    SwimmerFormationCertificatesComponent,
    NutritionComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    SwimmerRoutingModule,
    SharedModule,
    SwimmerFormationsComponent,
    PressVisitorModule
  ]
})
export class SwimmerModule {}

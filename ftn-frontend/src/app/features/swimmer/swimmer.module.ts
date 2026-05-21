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
import { SwimmerActualitesComponent } from './components/actualites/swimmer-actualites.component';
import { SwimmerClubComponent } from './components/club/swimmer-club.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    SwimmerLayoutComponent,
    SwimmerDashboardComponent,
    SwimmerPerformancesComponent,
    SwimmerCompetitionsComponent,
    SwimmerActualitesComponent,
    SwimmerClubComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    SwimmerRoutingModule,
    SharedModule
  ]
})
export class SwimmerModule {}

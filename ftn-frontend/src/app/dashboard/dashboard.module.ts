import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { DashboardActivityComponent } from './dashboard-activity/dashboard-activity.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { FilterToolbarComponent } from './components/filter-toolbar/filter-toolbar.component';

@NgModule({
  declarations: [
    DashboardActivityComponent,
    LineChartComponent,
    FilterToolbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule
  ],
  exports: [DashboardActivityComponent]
})
export class DashboardModule {}

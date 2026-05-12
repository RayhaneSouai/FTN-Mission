import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MyPerformancesComponent } from './features/my-performance/my-performances.component';
import { RankingComponent } from './features/ranking/ranking.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'performances',
    pathMatch: 'full'
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

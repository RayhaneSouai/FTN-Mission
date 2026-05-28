import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartnersDashboardComponent } from './pages/partners-dashboard/partners-dashboard.component';
import { PartnershipRequestComponent } from './pages/partnership-request/partnership-request.component';
import { SponsorshipRequestComponent } from './pages/sponsorship-request/sponsorship-request.component';
import { partnerGuard } from '../../core/guards/partner.guard';

const routes: Routes = [
  {
    path: '',
    component: PartnersDashboardComponent
  },
  {
    path: 'demande',
    component: PartnershipRequestComponent
  },
  {
    path: 'sponsoring',
    component: SponsorshipRequestComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartnersRoutingModule {}


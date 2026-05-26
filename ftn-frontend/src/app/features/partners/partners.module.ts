import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnersRoutingModule } from './partners-routing.module';
import { PartnersDashboardComponent } from './pages/partners-dashboard/partners-dashboard.component';
import { PartnershipRequestComponent } from './pages/partnership-request/partnership-request.component';
import { SponsorshipRequestComponent } from './pages/sponsorship-request/sponsorship-request.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PartnersDashboardComponent,
    PartnershipRequestComponent,
    SponsorshipRequestComponent,
  ],
  imports: [CommonModule, PartnersRoutingModule, ReactiveFormsModule],
})
export class PartnersModule {}


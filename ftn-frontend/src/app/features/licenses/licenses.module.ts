import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LicensesRoutingModule } from './licenses-routing.module';
import { LicenseListComponent } from './license-list/license-list.component';
import { LicenseFormComponent } from './license-form/license-form.component';

@NgModule({
  declarations: [
    LicenseListComponent,
    LicenseFormComponent
  ],
  imports: [
    CommonModule,
    LicensesRoutingModule,
    FormsModule
  ]
})
export class LicensesModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LicenseListComponent } from './license-list/license-list.component';
import { LicenseFormComponent } from './license-form/license-form.component';

const routes: Routes = [
  { path: '', component: LicenseListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LicensesRoutingModule { }

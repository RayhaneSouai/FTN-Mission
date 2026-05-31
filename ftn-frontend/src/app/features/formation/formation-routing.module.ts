import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormationAdminComponent } from './components/formation-admin/formation-admin.component';

const routes: Routes = [
  { path: '', component: FormationAdminComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormationRoutingModule {}

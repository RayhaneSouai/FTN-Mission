import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationRoutingModule } from './formation-routing.module';
import { FormationAdminComponent } from './components/formation-admin/formation-admin.component';
import { ToastContainerComponent } from '../competitions/components/toast-container/toast-container.component';

@NgModule({
  declarations: [FormationAdminComponent],
  imports: [
    CommonModule,
    FormsModule,
    FormationRoutingModule,
    ToastContainerComponent
  ]
})
export class FormationModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserImportWizardComponent } from './user-import/components/user-import-wizard/user-import-wizard.component';

const routes: Routes = [
  { path: '', component: UserListComponent },
  { path: 'import', component: UserImportWizardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PressListComponent } from './components/press-list/press-list.component';
import { PressFormComponent } from './components/press-form/press-form.component';
import { PressVisitorComponent } from './components/press-visitor/press-visitor.component';

const routes: Routes = [
  { path: '', component: PressListComponent },
  { path: 'visitor', component: PressVisitorComponent },
  { path: 'add', component: PressFormComponent },
  { path: 'edit/:id', component: PressFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PressRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PressListComponent } from './components/press-list/press-list.component';

import { PressVisitorComponent } from './components/press-visitor/press-visitor.component';

const routes: Routes = [
  { path: '', component: PressListComponent },
  { path: 'visitor', component: PressVisitorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PressRoutingModule { }

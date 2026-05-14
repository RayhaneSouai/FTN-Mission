import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PressRoutingModule } from './press-routing.module';
import { PressListComponent } from './components/press-list/press-list.component';
import { PressFormComponent } from './components/press-form/press-form.component';
import { PressVisitorComponent } from './components/press-visitor/press-visitor.component';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
  declarations: [
    PressListComponent,
    PressFormComponent,
    PressVisitorComponent,
    SafePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    PressRoutingModule
  ]
})
export class PressModule { }

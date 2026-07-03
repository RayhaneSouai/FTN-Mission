import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PressRoutingModule } from './press-routing.module';
import { PressListComponent } from './components/press-list/press-list.component';

import { PressVisitorModule } from './press-visitor.module';
import { SharedModule } from '../../shared/shared.module';
import { AdminUiModule } from '../../shared/admin-ui/admin-ui.module';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

@NgModule({
  declarations: [
    PressListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PressRoutingModule,
    SharedModule,
    AdminUiModule,
    PageHeroComponent,
    PressVisitorModule
  ]
})
export class PressModule { }

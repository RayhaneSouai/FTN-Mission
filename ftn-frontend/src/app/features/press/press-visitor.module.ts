import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PressVisitorComponent } from './components/press-visitor/press-visitor.component';
import { SharedModule } from '../../shared/shared.module';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

@NgModule({
  declarations: [PressVisitorComponent],
  imports: [CommonModule, FormsModule, SharedModule, PageHeroComponent],
  exports: [PressVisitorComponent]
})
export class PressVisitorModule {}

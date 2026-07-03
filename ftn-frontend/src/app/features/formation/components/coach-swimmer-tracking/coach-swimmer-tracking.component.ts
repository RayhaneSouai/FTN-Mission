import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero.component';
import { PAGE_HERO_IMAGES } from '../../../../shared/components/page-hero/page-hero.constants';

@Component({
  selector: 'app-coach-swimmer-tracking',
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  templateUrl: './coach-swimmer-tracking.component.html',
  styleUrl: './coach-swimmer-tracking.component.css'
})
export class CoachSwimmerTrackingComponent {
  readonly heroImage = PAGE_HERO_IMAGES.formation;
}

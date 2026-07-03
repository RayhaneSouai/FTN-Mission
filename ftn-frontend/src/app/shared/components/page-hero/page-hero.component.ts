import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-hero.component.html',
  styleUrl: './page-hero.component.css'
})
export class PageHeroComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() kicker = '';
  @Input() imageUrl = '';
  /** left | center */
  @Input() align: 'left' | 'center' = 'left';
  /** default | compact */
  @Input() size: 'default' | 'compact' = 'default';
}

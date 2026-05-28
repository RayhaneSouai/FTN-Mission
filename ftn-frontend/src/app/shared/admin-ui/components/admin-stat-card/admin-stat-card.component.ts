import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export type AdminStatVariant = 'blue' | 'azure' | 'orange' | 'indigo' | 'default';

@Component({
  selector: 'app-admin-stat-card',
  templateUrl: './admin-stat-card.component.html',
  styleUrls: ['./admin-stat-card.component.css']
})
export class AdminStatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '—';
  @Input() detail = '';
  @Input() icon = 'bi-graph-up';
  @Input() variant: AdminStatVariant = 'default';
  @Input() clickable = false;
  @Input() highlight = false;
  @Output() cardClick = new EventEmitter<void>();

  @HostListener('click')
  onCardClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    if (this.clickable) {
      event.preventDefault();
      this.cardClick.emit();
    }
  }

  @HostListener('keydown.space', ['$event'])
  onSpace(event: KeyboardEvent): void {
    if (this.clickable) {
      event.preventDefault();
      this.cardClick.emit();
    }
  }
}

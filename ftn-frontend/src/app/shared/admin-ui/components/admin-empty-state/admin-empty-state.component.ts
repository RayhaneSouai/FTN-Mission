import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-empty-state',
  templateUrl: './admin-empty-state.component.html',
  styleUrls: ['./admin-empty-state.component.css']
})
export class AdminEmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = 'Aucun élément';
  @Input() message = '';
}

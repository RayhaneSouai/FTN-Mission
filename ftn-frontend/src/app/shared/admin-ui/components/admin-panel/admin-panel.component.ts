import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() noPadding = false;
}

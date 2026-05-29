import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-welcome-banner',
  templateUrl: './admin-welcome-banner.component.html',
  styleUrls: ['./admin-welcome-banner.component.css']
})
export class AdminWelcomeBannerComponent {
  @Input() firstName = '';
  @Input() pendingCount = 0;

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

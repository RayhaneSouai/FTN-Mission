import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-skeleton',
  template: '<div class="admin-skeleton" [style.width]="width" [style.height]="height" [class.admin-skeleton--circle]="circle"></div>',
  styles: [`
    .admin-skeleton {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: adminShimmer 1.2s ease-in-out infinite;
      border-radius: 8px;
    }
    .admin-skeleton--circle { border-radius: 50%; }
    @keyframes adminShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class AdminSkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() circle = false;
}

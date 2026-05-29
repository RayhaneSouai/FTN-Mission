import { Component } from '@angular/core';
import { AdminToast, AdminToastService } from '../../services/admin-toast.service';

@Component({
  selector: 'app-admin-toast',
  templateUrl: './admin-toast.component.html',
  styleUrls: ['./admin-toast.component.css']
})
export class AdminToastComponent {
  toasts: AdminToast[] = [];

  constructor(private readonly toastService: AdminToastService) {
    this.toastService.stream$.subscribe((t) => (this.toasts = t));
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  icon(type: AdminToast['type']): string {
    const map = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
    return map[type];
  }
}

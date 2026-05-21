import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="dialog-overlay" (click)="onCancel()">
        <div class="dialog-box" (click)="$event.stopPropagation()">
          <h4 class="dialog-title">{{ title }}</h4>
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-actions">
            <button class="btn btn-secondary" (click)="onCancel()">Annuler</button>
            <button class="btn btn-danger" (click)="onConfirm()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.15s ease;
    }

    .dialog-box {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      min-width: 320px;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.2s ease;
    }

    .dialog-title {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #212529;
    }

    .dialog-message {
      margin: 0 0 1.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-secondary {
      background: #e9ecef;
      color: #495057;
    }
    .btn-secondary:hover { background: #dee2e6; }

    .btn-danger {
      background: #dc3545;
      color: white;
    }
    .btn-danger:hover { background: #bb2d3b; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: scale(0.95) translateY(-10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr ?';
  @Input() confirmLabel = 'Supprimer';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

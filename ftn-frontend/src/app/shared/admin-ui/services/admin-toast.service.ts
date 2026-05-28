import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AdminToast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminToastService {
  private seq = 0;
  private readonly toasts$ = new BehaviorSubject<AdminToast[]>([]);
  readonly stream$ = this.toasts$.asObservable();

  show(message: string, type: AdminToast['type'] = 'info', durationMs = 4000): void {
    const id = ++this.seq;
    const toast: AdminToast = { id, type, message };
    this.toasts$.next([...this.toasts$.value, toast]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 5500);
  }

  dismiss(id: number): void {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }
}

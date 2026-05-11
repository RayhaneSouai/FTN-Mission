import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private nextId = 0;
    private readonly _toasts = signal<Toast[]>([]);

    readonly toasts = computed(() => this._toasts());

    showSuccess(message: string): void {
        this.addToast('success', message);
    }

    showError(message: string): void {
        this.addToast('error', message);
    }

    showInfo(message: string): void {
        this.addToast('info', message);
    }

    dismiss(id: number): void {
        this._toasts.update((list) => list.filter((t) => t.id !== id));
    }

    private addToast(type: ToastType, message: string): void {
        const id = this.nextId++;
        this._toasts.update((list) => [...list, { id, type, message }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => this.dismiss(id), 4000);
    }
}

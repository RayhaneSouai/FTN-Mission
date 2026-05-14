import {
    Component,
    ChangeDetectionStrategy,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
    @Input() title = 'Confirmer';
    @Input() message = 'Êtes-vous sûr de vouloir continuer ?';
    @Input() confirmLabel = 'Oui, continuer';
    @Input() cancelLabel = 'Annuler';

    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    onBackdrop(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
            this.cancelled.emit();
        }
    }
}

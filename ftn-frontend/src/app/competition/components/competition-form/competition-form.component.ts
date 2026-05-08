import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  Competition,
  Discipline,
  CompetitionStatus,
  DISCIPLINE_LABELS,
  STATUS_LABELS,
  CompetitionRequest,
} from '../../models/competition.model';
import { CompetitionStateService } from '../../services/competition-state.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;
  if (start && end && end < start) {
    return { dateRange: true };
  }
  return null;
}

@Component({
  selector: 'app-competition-form',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './competition-form.component.html',
  styleUrl: './competition-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionFormComponent implements OnInit {
  @Input() competition: Competition | null = null;
  @Output() closed = new EventEmitter<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly state = inject(CompetitionStateService);
  private readonly toast = inject(ToastService);

  readonly isEditMode = signal(false);
  readonly showUnsavedConfirm = signal(false);

  readonly disciplines = Object.entries(DISCIPLINE_LABELS).map(([value, label]) => ({ value, label }));
  readonly statuses = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  readonly form = this.fb.group(
    {
      name: this.fb.control('', Validators.required),
      discipline: this.fb.control<Discipline>(Discipline.NATATION),
      startDate: this.fb.control('', Validators.required),
      endDate: this.fb.control('', Validators.required),
      location: this.fb.control('', Validators.required),
      region: this.fb.control('', Validators.required),
      status: this.fb.control<CompetitionStatus>(CompetitionStatus.PLANIFIEE),
    },
    { validators: dateRangeValidator }
  );

  ngOnInit(): void {
    if (this.competition) {
      this.isEditMode.set(true);
      this.form.patchValue({
        name: this.competition.name,
        discipline: this.competition.discipline,
        startDate: this.competition.startDate,
        endDate: this.competition.endDate,
        location: this.competition.location,
        region: this.competition.region,
        status: this.competition.status,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CompetitionRequest = this.form.getRawValue();

    if (this.isEditMode() && this.competition) {
      this.state.updateCompetition(this.competition.id, dto);
      this.toast.showSuccess('Compétition mise à jour avec succès.');
    } else {
      this.state.addCompetition(dto);
      this.toast.showSuccess('Compétition créée avec succès.');
    }
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.tryClose();
    }
  }

  tryClose(): void {
    if (this.form.dirty) {
      this.showUnsavedConfirm.set(true);
    } else {
      this.closed.emit();
    }
  }

  onDiscardConfirmed(): void {
    this.showUnsavedConfirm.set(false);
    this.closed.emit();
  }

  onDiscardCancelled(): void {
    this.showUnsavedConfirm.set(false);
  }
}

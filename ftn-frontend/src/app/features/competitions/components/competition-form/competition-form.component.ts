import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  Competition,
  Discipline,
  Region,
  Piscine,
  DISCIPLINE_LABELS,
  REGION_LABELS,
  PISCINE_LABELS,
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
  readonly selectedRegion = signal<string>('');

  readonly disciplines = Object.entries(DISCIPLINE_LABELS).map(([value, label]) => ({ value, label }));
  readonly regions = Object.entries(REGION_LABELS).map(([value, label]) => ({ value, label }));

  private readonly REGION_PISCINES: Record<string, Piscine[]> = {
    [Region.GRAND_TUNIS]: [
      Piscine.RADES_OLYMPIQUE,
      Piscine.MENZAH_OLYMPIQUE,
      Piscine.BELVEDERE,
      Piscine.EZZAHRA_OLYMPIQUE,
      Piscine.LA_MARSA_MUNICIPALE,
      Piscine.BEN_AROUS
    ],
    [Region.SAHEL]: [
      Piscine.SOUSSE_OLYMPIQUE,
      Piscine.MONASTIR_OLYMPIQUE,
      Piscine.HAMMAMET
    ],
    [Region.SUD]: [
      Piscine.SFAX_MUNICIPALE
    ],
  };

  readonly filteredPiscines = computed(() => {
    const region = this.selectedRegion();
    const allowed = this.REGION_PISCINES[region] ?? [];
    return allowed.map((p) => ({ value: p, label: PISCINE_LABELS[p] }));
  });

  readonly form = this.fb.group(
    {
      name: this.fb.control('', Validators.required),
      description: this.fb.control(''),
      discipline: this.fb.control<Discipline>(Discipline.NATATION),
      startDate: this.fb.control('', Validators.required),
      endDate: this.fb.control('', Validators.required),
      region: this.fb.control<string>('', Validators.required),
      lieu: this.fb.control<string>('', Validators.required),
    },
    { validators: dateRangeValidator }
  );

  ngOnInit(): void {
    if (this.competition) {
      this.isEditMode.set(true);
      this.selectedRegion.set(this.competition.region ?? '');
      this.form.patchValue({
        name: this.competition.name,
        description: this.competition.description ?? '',
        discipline: this.competition.discipline,
        startDate: this.competition.startDate,
        endDate: this.competition.endDate,
        region: this.competition.region ?? '',
        lieu: this.competition.lieu ?? '',
      });
    }
  }

  onRegionChange(): void {
    this.selectedRegion.set(this.form.controls.region.value);
    this.form.controls.lieu.setValue('');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto: CompetitionRequest = {
      name: raw.name,
      description: raw.description || undefined,
      discipline: raw.discipline,
      startDate: raw.startDate,
      endDate: raw.endDate,
      region: raw.region,
      lieu: raw.lieu,
    };

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

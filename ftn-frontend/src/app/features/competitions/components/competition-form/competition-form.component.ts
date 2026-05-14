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
  Secteur,
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
  readonly selectedSecteur = signal<Secteur>(Secteur.NATIONAL);
  readonly selectedRegion = signal<string>('');

  readonly isNational = computed(() => this.selectedSecteur() === Secteur.NATIONAL);

  readonly disciplines = Object.entries(DISCIPLINE_LABELS).map(([value, label]) => ({ value, label }));
  readonly regions = Object.entries(REGION_LABELS).map(([value, label]) => ({ value, label }));

  /** Piscines filtered by selected region */
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
      secteur: this.fb.control<Secteur>(Secteur.NATIONAL),
      // National
      region: this.fb.control<string>(''),
      lieu: this.fb.control<string>(''),
      // International
      country: this.fb.control(''),
      city: this.fb.control(''),
      venue: this.fb.control(''),
    },
    { validators: dateRangeValidator }
  );

  ngOnInit(): void {
    if (this.competition) {
      this.isEditMode.set(true);
      const secteur = this.competition.secteur ?? Secteur.NATIONAL;
      this.selectedSecteur.set(secteur);
      this.selectedRegion.set(this.competition.region ?? '');
      this.form.patchValue({
        name: this.competition.name,
        description: this.competition.description ?? '',
        discipline: this.competition.discipline,
        startDate: this.competition.startDate,
        endDate: this.competition.endDate,
        secteur,
        region: this.competition.region ?? '',
        lieu: this.competition.lieu ?? '',
        country: this.competition.country ?? '',
        city: this.competition.city ?? '',
        venue: this.competition.venue ?? '',
      });
    }
    this.updateValidators();
  }

  onSecteurChange(value: string): void {
    this.selectedSecteur.set(value as Secteur);
    this.form.controls.secteur.setValue(value as Secteur);
    this.updateValidators();
  }

  onRegionChange(): void {
    // Update signal and reset piscine when region changes
    this.selectedRegion.set(this.form.controls.region.value);
    this.form.controls.lieu.setValue('');
  }

  private updateValidators(): void {
    if (this.isNational()) {
      this.form.controls.region.setValidators(Validators.required);
      this.form.controls.lieu.setValidators(Validators.required);
      this.form.controls.country.clearValidators();
      this.form.controls.city.clearValidators();
      this.form.controls.venue.clearValidators();
    } else {
      this.form.controls.region.clearValidators();
      this.form.controls.lieu.clearValidators();
      this.form.controls.country.setValidators(Validators.required);
      this.form.controls.city.setValidators(Validators.required);
      this.form.controls.venue.setValidators(Validators.required);
    }
    this.form.controls.region.updateValueAndValidity();
    this.form.controls.lieu.updateValueAndValidity();
    this.form.controls.country.updateValueAndValidity();
    this.form.controls.city.updateValueAndValidity();
    this.form.controls.venue.updateValueAndValidity();
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
      secteur: raw.secteur,
      ...(this.isNational()
        ? { region: raw.region, lieu: raw.lieu }
        : { country: raw.country, city: raw.city, venue: raw.venue }),
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

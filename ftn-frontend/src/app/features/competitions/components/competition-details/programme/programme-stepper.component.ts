import { Component, OnInit, Input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgrammeApiService } from '../../../services/programme-api.service';
import { CompetitionStateService } from '../../../services/competition-state.service';
import {
  ProgrammeStatusResponse, ProgrammeDayResponse, ProgramItemResponse,
  ProgramItemRequest, ProgramItemType, PROGRAM_ITEM_PRESETS, Categorie, CATEGORIE_LABELS
} from '../../../models/competition.model';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ToastService } from '../../../services/toast.service';
import { timeFormatValidator, timeAfterValidator } from './validators';

@Component({
  selector: 'app-programme-stepper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './programme-stepper.component.html',
  styleUrls: ['./programme-stepper.component.scss']
})
export class ProgrammeStepperComponent implements OnInit {
  private readonly state = inject(CompetitionStateService);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProgrammeApiService);
  private readonly toast = inject(ToastService);

  @Input() inputCompetitionId?: number;

  competitionId = signal<number>(0);
  status = signal<ProgrammeStatusResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  selectedDayId = signal<number | null>(null);

  // Edit mode
  editingItemId = signal<number | null>(null);

  // Delete confirmation dialog
  deleteDialogVisible = signal(false);
  deleteTargetId = signal<number | null>(null);
  deleteTargetLabel = signal('');

  readonly presets = PROGRAM_ITEM_PRESETS;
  readonly allCategories = Object.values(Categorie);
  readonly categorieLabels = CATEGORIE_LABELS;

  /** All system categories available for selection in the dropdown */
  allowedCategories = computed(() => {
    return this.allCategories;
  });

  /** Whether program is locked (competition start date reached OR programme approved) */
  programmeLocked = computed(() => {
    const comp = this.state.selectedCompetition();
    if (!comp?.startDate) return this.status()?.programmeStatus === 'APPROVED';
    const startPassed = new Date().toISOString().split('T')[0] >= comp.startDate;
    return startPassed || this.status()?.programmeStatus === 'APPROVED';
  });

  itemForm!: FormGroup;

  // Computed signals
  programGenerated = computed(() => this.status()?.programGenerated ?? false);
  days = computed(() => this.status()?.days ?? []);
  totalDays = computed(() => this.status()?.totalDaysRequired ?? 0);

  selectedDay = computed(() => {
    const id = this.selectedDayId();
    return this.days().find(d => d.id === id) ?? null;
  });

  /** Latest time in current day (used for chronological validation) */
  latestTimeInDay = computed(() => {
    const day = this.selectedDay();
    if (!day || day.items.length === 0) return null;
    // When editing, exclude the item being edited
    const editId = this.editingItemId();
    const items = editId ? day.items.filter(i => i.id !== editId) : day.items;
    if (items.length === 0) return null;
    return items[items.length - 1].time; // items are ordered by time ASC from backend
  });

  ngOnInit(): void {
    if (this.inputCompetitionId) {
      this.competitionId.set(this.inputCompetitionId);
      this.loadStatus();
    } else {
      const comp = this.state.selectedCompetition();
      if (comp) {
        this.competitionId.set(comp.id);
        this.loadStatus();
      }
    }
    this.initForm();
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      label: ['', Validators.required],
      time: ['', [Validators.required, timeFormatValidator(), timeAfterValidator(() => this.latestTimeInDay())]],
      type: ['PART', Validators.required],
      numberOfParticipants: [null],
      swimmerCategory: [null],
      seriesGender: [null]
    });
  }

  /** Revalidate time field (e.g. after day switch or after items change) */
  private revalidateTime(): void {
    this.itemForm.get('time')?.updateValueAndValidity();
  }

  get isSeriesType(): boolean {
    return this.itemForm.get('type')?.value === 'SERIES';
  }

  get isEditing(): boolean {
    return this.editingItemId() !== null;
  }

  // ─── Data Loading ───

  loadStatus(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getProgrammeStatus(this.competitionId()).subscribe({
      next: (res) => {
        this.status.set(res);
        this.loading.set(false);
        if (!this.selectedDayId() && res.days.length > 0) {
          this.selectedDayId.set(res.days[0].id);
        }
        this.revalidateTime();
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  // ─── Generate Programme ───

  generateProgramme(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.generateProgramme(this.competitionId()).subscribe({
      next: (res) => {
        this.status.set(res);
        this.loading.set(false);
        if (res.days.length > 0) {
          this.selectedDayId.set(res.days[0].id);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la génération');
        this.loading.set(false);
      }
    });
  }

  // ─── Day Selection ───

  selectDay(day: ProgrammeDayResponse): void {
    this.selectedDayId.set(day.id);
    this.cancelEdit();
    this.revalidateTime();
  }

  // ─── Presets ───

  applyPreset(preset: { label: string; type: ProgramItemType }): void {
    this.itemForm.patchValue({ label: preset.label, type: preset.type });
  }

  // ─── Add Item ───

  submitItem(): void {
    if (this.itemForm.invalid || !this.selectedDayId()) return;

    const type = this.itemForm.value.type as ProgramItemType;
    if (type === 'SERIES' && (!this.itemForm.value.numberOfParticipants || this.itemForm.value.numberOfParticipants < 1)) {
      this.error.set('Le nombre de participants est obligatoire pour une série.');
      return;
    }

    if (type === 'SERIES' && !this.itemForm.value.swimmerCategory) {
      this.error.set('La catégorie de nageur est obligatoire pour une série.');
      return;
    }

    const request: ProgramItemRequest = {
      label: this.itemForm.value.label,
      time: this.itemForm.value.time,
      type: type,
      numberOfParticipants: type === 'SERIES' ? this.itemForm.value.numberOfParticipants : undefined,
      swimmerCategory: type === 'SERIES' ? this.itemForm.value.swimmerCategory : undefined,
      seriesGender: type === 'SERIES' ? this.itemForm.value.seriesGender : undefined
    };

    this.loading.set(true);
    this.error.set(null);

    if (this.isEditing) {
      // Update mode
      this.api.updateProgramItem(this.competitionId(), this.editingItemId()!, request).subscribe({
        next: () => {
          this.toast.showSuccess('Élément modifié avec succès');
          this.cancelEdit();
          this.loadStatus();
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'Erreur lors de la modification');
          this.loading.set(false);
        }
      });
    } else {
      // Add mode
      this.api.addProgramItem(this.competitionId(), this.selectedDayId()!, request).subscribe({
        next: () => {
          this.toast.showSuccess('Élément ajouté avec succès');
          this.resetForm();
          this.loadStatus();
        },
        error: (err) => {
          this.error.set(err.error?.message ?? "Erreur lors de l'ajout");
          this.loading.set(false);
        }
      });
    }
  }

  // ─── Edit Item ───

  editItem(item: ProgramItemResponse): void {
    this.editingItemId.set(item.id);
    this.itemForm.patchValue({
      label: item.label,
      time: item.time,
      type: item.type,
      numberOfParticipants: item.numberOfParticipants ?? null,
      swimmerCategory: item.swimmerCategory ?? null,
      seriesGender: item.seriesGender ?? null
    });
    this.revalidateTime();
  }

  cancelEdit(): void {
    this.editingItemId.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.itemForm.reset({ label: '', time: '', type: 'PART', numberOfParticipants: null, swimmerCategory: null, seriesGender: null });
    this.revalidateTime();
  }

  // ─── Delete Item (with confirmation dialog) ───

  requestDelete(item: ProgramItemResponse): void {
    this.deleteTargetId.set(item.id);
    this.deleteTargetLabel.set(item.label);
    this.deleteDialogVisible.set(true);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.deleteDialogVisible.set(false);
    this.loading.set(true);
    this.error.set(null);
    this.api.deleteProgramItem(this.competitionId(), id).subscribe({
      next: () => {
        if (this.editingItemId() === id) {
          this.cancelEdit();
        }
        this.loadStatus();
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur de suppression');
        this.loading.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.deleteDialogVisible.set(false);
    this.deleteTargetId.set(null);
  }

  // ─── Validation helpers for template ───

  get timeErrors(): string | null {
    const ctrl = this.itemForm.get('time');
    if (!ctrl?.touched || ctrl.valid) return null;
    if (ctrl.hasError('required')) return "L'heure est obligatoire.";
    if (ctrl.hasError('timeFormat')) return "Format invalide (attendu: HH:mm).";
    if (ctrl.hasError('timeNotAfter')) {
      const latest = ctrl.getError('timeNotAfter')?.latestTime;
      return `L'heure doit être postérieure à ${latest}.`;
    }
    return null;
  }

  getCategoryLabel(cat: string): string {
    return (this.categorieLabels as Record<string, string>)[cat] ?? cat;
  }


}

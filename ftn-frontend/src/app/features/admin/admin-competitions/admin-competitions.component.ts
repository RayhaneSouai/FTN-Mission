import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  Competition,
  Discipline,
  Region,
  Piscine,
  DISCIPLINE_LABELS,
  REGION_LABELS,
  PISCINE_LABELS,
  CATEGORIE_LABELS,
  CompetitionRequest,
  Categorie,
} from '../../competitions/models/competition.model';
import { AdminCompetitionApiService } from './admin-competition-api.service';

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;
  const deadline = control.get('participationDeadline')?.value;
  const errors: ValidationErrors = {};
  if (start && end && end < start) errors['dateRange'] = true;
  if (deadline && start && deadline >= start) errors['deadlineAfterStart'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-admin-competitions',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="admin-competitions">
      <div class="page-header">
        <div>
          <h2>Gestion des Compétitions</h2>
          <p class="subtitle">Créez, modifiez et gérez les compétitions et leurs programmes.</p>
        </div>
        <button class="btn-create" (click)="openCreate()">+ Nouvelle compétition</button>
      </div>

      <div class="comp-table-wrap">
        <table class="comp-table">
          <thead>
            <tr>
              <th>Compétition</th>
              <th>Discipline</th>
              <th>Catégories</th>
              <th>Dates</th>
              <th>Statut programme</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (comp of competitions(); track comp.id) {
              <tr>
                <td class="name-cell">{{ comp.name }}</td>
                <td>{{ disciplineLabel(comp.discipline) }}</td>
                <td>{{ (comp.allowedCategories ?? []).length ? (comp.allowedCategories ?? []).join(', ') : 'Toutes' }}</td>
                <td>{{ comp.startDate | date:'dd/MM/yyyy' }} - {{ comp.endDate | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [class.draft]="comp.programmeStatus === 'DRAFT'" [class.approved]="comp.programmeStatus === 'APPROVED'" [class.none]="!comp.programmeStatus">
                    {{ comp.programmeStatus === 'APPROVED' ? 'Approuvé' : comp.programmeStatus === 'DRAFT' ? 'Brouillon' : 'Non généré' }}
                  </span>
                </td>
                <td class="action-cell">
                  <a [routerLink]="['/admin/competitions', comp.id, 'programme']" class="btn-action btn-prog">Programme</a>
                  <button class="btn-action btn-edit" (click)="openEdit(comp)">Modifier</button>
                  <button class="btn-action btn-del" (click)="confirmDelete(comp)">Supprimer</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (competitions().length === 0) {
        <div class="empty">Aucune compétition. Cliquez sur "Nouvelle compétition" pour commencer.</div>
      }
    </div>

    <!-- Modal Form -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ editingComp() ? 'Modifier la compétition' : 'Nouvelle compétition' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Nom *</label>
              <input formControlName="name" placeholder="Nom de la compétition" [class.input-error]="form.controls.name.touched && form.controls.name.invalid" />
              @if (form.controls.name.touched && form.controls.name.hasError('required')) {
                <span class="field-error">Le nom est obligatoire.</span>
              }
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Discipline *</label>
                <select formControlName="discipline">
                  @for (d of disciplines; track d.value) {
                    <option [value]="d.value">{{ d.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Catégories d'âge autorisées</label>
                <div class="multi-select" (click)="dropdownOpen.set(!dropdownOpen()); $event.stopPropagation()">
                  <div class="multi-select__display">
                    @if (selectedCategories().size === 0) {
                      <span class="multi-select__placeholder">Toutes catégories</span>
                    } @else {
                      @for (c of selectedCategoriesArray(); track c) {
                        <span class="multi-select__tag">{{ categorieLabel(c) }}
                          <button type="button" class="multi-select__tag-remove" (click)="toggleCategory(c); $event.stopPropagation()">×</button>
                        </span>
                      }
                    }
                  </div>
                  <span class="multi-select__chevron">▾</span>
                  @if (dropdownOpen()) {
                    <div class="multi-select__dropdown" (click)="$event.stopPropagation()">
                      @for (c of categories; track c) {
                        <div class="multi-select__option" [class.selected]="isCategorySelected(c)" (click)="toggleCategory(c)">
                          <span>{{ categorieLabel(c) }}</span>
                          @if (isCategorySelected(c)) {
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Région *</label>
                <select formControlName="region" (change)="onRegionChange()" [class.input-error]="form.controls.region.touched && form.controls.region.invalid">
                  <option value="">Sélectionner</option>
                  @for (r of regions; track r.value) {
                    <option [value]="r.value">{{ r.label }}</option>
                  }
                </select>
                @if (form.controls.region.touched && form.controls.region.hasError('required')) {
                  <span class="field-error">La région est obligatoire.</span>
                }
              </div>
              <div class="form-group">
                <label>Piscine *</label>
                <select formControlName="lieu" [class.input-error]="form.controls.lieu.touched && form.controls.lieu.invalid">
                  <option value="">Sélectionner</option>
                  @for (p of filteredPiscines(); track p.value) {
                    <option [value]="p.value">{{ p.label }}</option>
                  }
                </select>
                @if (form.controls.lieu.touched && form.controls.lieu.hasError('required')) {
                  <span class="field-error">La piscine est obligatoire.</span>
                }
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date début *</label>
                <input type="date" formControlName="startDate" [class.input-error]="form.controls.startDate.touched && form.controls.startDate.invalid" />
                @if (form.controls.startDate.touched && form.controls.startDate.hasError('required')) {
                  <span class="field-error">La date de début est obligatoire.</span>
                }
              </div>
              <div class="form-group">
                <label>Date fin *</label>
                <input type="date" formControlName="endDate" [class.input-error]="form.controls.endDate.touched && form.controls.endDate.invalid" />
                @if (form.controls.endDate.touched && form.controls.endDate.hasError('required')) {
                  <span class="field-error">La date de fin est obligatoire.</span>
                }
              </div>
            </div>
            @if (form.hasError('dateRange')) {
              <div class="form-error">La date de fin doit être postérieure ou égale à la date de début.</div>
            }

            <!-- Participation Conditions -->
            <div class="section-divider">
              <span class="divider-label">Conditions de Participation</span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date limite d'inscription</label>
                <input type="date" formControlName="participationDeadline" />
              </div>
              <div class="form-group">
                <label>Genre autorisé</label>
                <select formControlName="allowedGender">
                  <option value="">Tous</option>
                  <option value="HOMME">Hommes</option>
                  <option value="FEMME">Femmes</option>
                </select>
              </div>
            </div>
            @if (form.hasError('deadlineAfterStart')) {
              <div class="form-error">La date limite d'inscription doit être strictement antérieure à la date de début.</div>
            }
            <div class="form-row">
              <div class="form-group">
                <label>Épreuves max / nageur</label>
                <input type="number" formControlName="maxEvents" min="1" placeholder="Illimité" />
              </div>
            </div>
            <div class="form-group">
              <label>Conditions supplémentaires (texte libre)</label>
              <textarea formControlName="customConditions" rows="3" placeholder="Ex: Doit être membre de l'équipe nationale, qualification régionale requise..."></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn-submit" [disabled]="form.invalid">
                {{ editingComp() ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete confirm -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="deleteTarget.set(null)">
        <div class="modal-content modal-content--sm" (click)="$event.stopPropagation()">
          <h3>Supprimer la compétition</h3>
          <p>Voulez-vous vraiment supprimer <strong>{{ deleteTarget()!.name }}</strong> ? Cette action est irréversible.</p>
          <div class="form-actions">
            <button class="btn-cancel" (click)="deleteTarget.set(null)">Annuler</button>
            <button class="btn-submit btn-submit--danger" (click)="onDeleteConfirmed()">Supprimer</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-competitions { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    h2 { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.25rem; }
    .subtitle { color: #6c757d; font-size: 0.85rem; margin: 0; }
    .btn-create {
      padding: 0.55rem 1.1rem; background: #1565C0; color: white; border: none; border-radius: 8px;
      font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap;
      &:hover { background: #0d47a1; }
    }
    .comp-table-wrap { overflow-x: auto; }
    .comp-table {
      width: 100%; border-collapse: collapse; font-size: 0.85rem;
      th, td { padding: 0.65rem 0.75rem; text-align: left; border-bottom: 1px solid #e9ecef; }
      th { background: #f8f9fa; font-weight: 600; color: #495057; }
    }
    .name-cell { font-weight: 600; }
    .badge {
      padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;
      &.draft { background: #fff3cd; color: #856404; }
      &.approved { background: #d1e7dd; color: #0f5132; }
      &.none { background: #e9ecef; color: #6c757d; }
    }
    .action-cell { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .btn-action {
      padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;
      text-decoration: none; border: none; cursor: pointer;
    }
    .btn-prog { background: #1565C0; color: white; &:hover { background: #0d47a1; } }
    .btn-edit { background: #e3f2fd; color: #1565C0; &:hover { background: #bbdefb; } }
    .btn-del { background: #fce4ec; color: #c62828; &:hover { background: #ffcdd2; } }
    .empty { text-align: center; padding: 3rem; color: #6c757d; font-size: 0.9rem; }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: white; border-radius: 12px; padding: 1.5rem; width: 560px; max-width: 95vw;
      max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #1a1a2e; }
    }
    .modal-content--sm { width: 400px; }
    .form-group {
      margin-bottom: 0.75rem;
      label { display: block; font-size: 0.8rem; font-weight: 600; color: #495057; margin-bottom: 0.25rem; }
      input, select, textarea {
        width: 100%; padding: 0.5rem 0.65rem; border: 1px solid #dee2e6; border-radius: 6px;
        font-size: 0.85rem; outline: none; box-sizing: border-box;
        &:focus { border-color: #1565C0; box-shadow: 0 0 0 2px rgba(21,101,192,0.15); }
      }
    }
    .form-row { display: flex; gap: 0.75rem; .form-group { flex: 1; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
    .btn-cancel {
      padding: 0.5rem 1rem; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px;
      font-size: 0.85rem; cursor: pointer; &:hover { background: #e9ecef; }
    }
    .btn-submit {
      padding: 0.5rem 1rem; background: #1565C0; color: white; border: none; border-radius: 6px;
      font-size: 0.85rem; font-weight: 600; cursor: pointer;
      &:hover { background: #0d47a1; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-submit--danger { background: #c62828; &:hover { background: #b71c1c; } }
    .section-divider {
      margin: 1rem 0 0.75rem;
      border-top: 1px solid #e9ecef;
      padding-top: 0.75rem;
      .divider-label {
        font-size: 0.8rem; font-weight: 700; color: #1565C0; text-transform: uppercase; letter-spacing: 0.03em;
      }
    }

    /* Multi-select dropdown */
    .multi-select {
      position: relative;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.4rem 0.65rem; border: 1px solid #dee2e6; border-radius: 6px;
      min-height: 38px; cursor: pointer; background: white;
      &:hover { border-color: #1565C0; }
    }
    .multi-select__display { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }
    .multi-select__placeholder { color: #9e9e9e; font-size: 0.82rem; }
    .multi-select__chevron { font-size: 0.8rem; color: #6c757d; margin-left: 4px; }
    .multi-select__tag {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 2px 8px; background: #e3f2fd; color: #1565C0;
      border-radius: 12px; font-size: 0.72rem; font-weight: 600;
    }
    .multi-select__tag-remove {
      background: none; border: none; color: #1565C0; font-size: 0.9rem;
      cursor: pointer; padding: 0; line-height: 1;
      &:hover { color: #c62828; }
    }
    .multi-select__dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: white; border: 1px solid #dee2e6; border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 10;
      max-height: 200px; overflow-y: auto; padding: 0.4rem 0;
    }
    .multi-select__option {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.5rem 0.75rem; cursor: pointer; font-size: 0.82rem; color: #333;
      border-radius: 4px; margin: 0 4px;
      &:hover { background: #f0f7ff; }
      &.selected { background: #e3f2fd; color: #1565C0; font-weight: 600; }
      svg { color: #1565C0; }
    }

    /* Validation errors */
    .field-error {
      display: block; font-size: 0.72rem; color: #d32f2f; margin-top: 3px; font-weight: 500;
    }
    .form-error {
      background: #fff3e0; border: 1px solid #ffcc80; border-radius: 6px;
      padding: 0.45rem 0.75rem; font-size: 0.78rem; color: #e65100;
      margin-bottom: 0.75rem; font-weight: 500;
    }
    .input-error {
      border-color: #d32f2f !important;
      &:focus { box-shadow: 0 0 0 2px rgba(211,47,47,0.15) !important; }
    }
  `]
})
export class AdminCompetitionsComponent implements OnInit {
  private readonly api = inject(AdminCompetitionApiService);
  private readonly fb = inject(NonNullableFormBuilder);

  competitions = signal<Competition[]>([]);
  modalOpen = signal(false);
  editingComp = signal<Competition | null>(null);
  deleteTarget = signal<Competition | null>(null);
  selectedRegion = signal('');

  readonly disciplines = Object.entries(DISCIPLINE_LABELS).map(([value, label]) => ({ value, label }));
  readonly regions = Object.entries(REGION_LABELS).map(([value, label]) => ({ value, label }));
  readonly categories = Object.values(Categorie);

  private readonly REGION_PISCINES: Record<string, Piscine[]> = {
    [Region.GRAND_TUNIS]: [Piscine.RADES_OLYMPIQUE, Piscine.MENZAH_OLYMPIQUE, Piscine.BELVEDERE, Piscine.EZZAHRA_OLYMPIQUE, Piscine.LA_MARSA_MUNICIPALE, Piscine.BEN_AROUS],
    [Region.SAHEL]: [Piscine.SOUSSE_OLYMPIQUE, Piscine.MONASTIR_OLYMPIQUE, Piscine.HAMMAMET],
    [Region.SUD]: [Piscine.SFAX_MUNICIPALE],
  };

  filteredPiscines = signal<{ value: string; label: string }[]>([]);

  readonly form = this.fb.group({
    name: this.fb.control('', Validators.required),
    description: this.fb.control(''),
    discipline: this.fb.control<Discipline>(Discipline.NATATION),
    startDate: this.fb.control('', Validators.required),
    endDate: this.fb.control('', Validators.required),
    region: this.fb.control<string>('', Validators.required),
    lieu: this.fb.control<string>('', Validators.required),
    allowedGender: this.fb.control<string>(''),
    participationDeadline: this.fb.control<string>(''),
    maxEvents: this.fb.control<number | null>(null),
    customConditions: this.fb.control(''),
  }, { validators: dateRangeValidator });

  /** Selected age categories (multi-select dropdown) */
  selectedCategories = signal<Set<Categorie>>(new Set());
  dropdownOpen = signal(false);

  selectedCategoriesArray(): Categorie[] {
    return Array.from(this.selectedCategories());
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.dropdownOpen.set(false);
  }

  isCategorySelected(c: Categorie): boolean {
    return this.selectedCategories().has(c);
  }

  toggleCategory(c: Categorie): void {
    const current = new Set(this.selectedCategories());
    if (current.has(c)) { current.delete(c); } else { current.add(c); }
    this.selectedCategories.set(current);
  }

  categorieLabel(c: string): string {
    return (CATEGORIE_LABELS as Record<string, string>)[c] ?? c;
  }

  disciplineLabel(d: string): string { return (DISCIPLINE_LABELS as Record<string, string>)[d] ?? d; }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.api.getAll().subscribe(comps => this.competitions.set(comps));
  }

  onRegionChange(): void {
    const region = this.form.controls.region.value;
    this.selectedRegion.set(region);
    const allowed = this.REGION_PISCINES[region] ?? [];
    this.filteredPiscines.set(allowed.map(p => ({ value: p, label: PISCINE_LABELS[p] })));
    this.form.controls.lieu.setValue('');
  }

  openCreate(): void {
    this.editingComp.set(null);
    this.form.reset({ discipline: Discipline.NATATION, region: '', lieu: '', allowedGender: '', participationDeadline: '', maxEvents: null, customConditions: '' });
    this.selectedCategories.set(new Set());
    this.filteredPiscines.set([]);
    this.modalOpen.set(true);
  }

  openEdit(comp: Competition): void {
    this.editingComp.set(comp);
    this.selectedRegion.set(comp.region ?? '');
    const allowed = this.REGION_PISCINES[comp.region ?? ''] ?? [];
    this.filteredPiscines.set(allowed.map(p => ({ value: p, label: PISCINE_LABELS[p] })));
    this.selectedCategories.set(new Set((comp.allowedCategories ?? []) as Categorie[]));
    this.form.patchValue({
      name: comp.name,
      description: comp.description ?? '',
      discipline: comp.discipline,
      startDate: comp.startDate,
      endDate: comp.endDate,
      region: comp.region ?? '',
      lieu: comp.lieu ?? '',
      allowedGender: comp.allowedGender ?? '',
      participationDeadline: comp.participationDeadline ?? '',
      maxEvents: comp.maxEvents ?? null,
      customConditions: comp.customConditions ?? '',
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingComp.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.getRawValue();
    const cats = Array.from(this.selectedCategories());
    const dto: any = {
      name: raw.name,
      description: raw.description || undefined,
      discipline: raw.discipline,
      allowedCategories: cats.length > 0 ? cats : [],
      startDate: raw.startDate,
      endDate: raw.endDate,
      region: raw.region,
      lieu: raw.lieu,
      participationDeadline: raw.participationDeadline || null,
      allowedGender: raw.allowedGender || null,
      maxEvents: raw.maxEvents || null,
      customConditions: raw.customConditions || null,
    };

    if (this.editingComp()) {
      const payload: Competition = { ...dto, id: this.editingComp()!.id };
      this.api.update(payload).subscribe(() => { this.loadAll(); this.closeModal(); });
    } else {
      this.api.create(dto).subscribe(() => { this.loadAll(); this.closeModal(); });
    }
  }

  confirmDelete(comp: Competition): void {
    this.deleteTarget.set(comp);
  }

  onDeleteConfirmed(): void {
    const comp = this.deleteTarget();
    if (!comp) return;
    this.api.delete(comp.id).subscribe(() => { this.loadAll(); this.deleteTarget.set(null); });
  }
}

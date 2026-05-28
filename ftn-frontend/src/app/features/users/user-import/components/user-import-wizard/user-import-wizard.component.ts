import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserImportFacadeService } from '../../services/user-import-facade.service';
import { UserImportColumnMapperService } from '../../services/user-import-column-mapper.service';
import {
  USER_IMPORT_ACCEPT,
  USER_IMPORT_MAX_FILE_BYTES,
  USER_IMPORT_PREVIEW_ROWS
} from '../../constants/user-import.constants';
import {
  USER_IMPORT_FIELD_LABELS,
  UserImportField,
  MappedUserRow,
  RowValidationIssue,
  UserImportStep
} from '../../models/user-import.types';

export interface MappingRowDef {
  field: UserImportField;
  label: string;
  icon: string;
  required?: boolean;
  optional?: boolean;
}

interface WizardStepDef {
  id: UserImportStep;
  label: string;
  hint: string;
  icon: string;
}

@Component({
  selector: 'app-user-import-wizard',
  templateUrl: './user-import-wizard.component.html',
  styleUrls: ['./user-import-wizard.component.css'],
  providers: [UserImportFacadeService]
})
export class UserImportWizardComponent {
  readonly accept = USER_IMPORT_ACCEPT;
  readonly maxSizeLabel = `${USER_IMPORT_MAX_FILE_BYTES / (1024 * 1024)} Mo`;
  readonly previewLimit = USER_IMPORT_PREVIEW_ROWS;
  readonly fieldLabels = USER_IMPORT_FIELD_LABELS;
  readonly wizardSteps: WizardStepDef[] = [
    { id: 'upload', label: 'Fichier', hint: 'CSV', icon: 'bi-cloud-arrow-up' },
    { id: 'mapping', label: 'Colonnes', hint: 'Association', icon: 'bi-diagram-3' },
    { id: 'validation', label: 'Contrôle', hint: 'Erreurs', icon: 'bi-shield-check' },
    { id: 'preview', label: 'Aperçu', hint: 'Données', icon: 'bi-table' },
    { id: 'confirm', label: 'Validation', hint: 'Confirmation', icon: 'bi-check2-square' },
    { id: 'import', label: 'Import', hint: 'Exécution', icon: 'bi-box-arrow-in-down' }
  ];

  selectedFile: File | null = null;
  isDragging = false;
  identityMode: 'full' | 'split' = 'full';
  showOptionalFields = false;

  constructor(
    readonly facade: UserImportFacadeService,
    readonly columnMapper: UserImportColumnMapperService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get availableColumns(): string[] {
    return this.facade.parsed?.headers ?? [];
  }

  get mappingStatus() {
    return this.columnMapper.getMappingStatus(this.facade.fieldMap);
  }

  get progressPercent(): number {
    const order: UserImportStep[] = ['upload', 'mapping', 'validation', 'preview', 'confirm', 'import'];
    const current = this.facade.step === 'result' ? 'import' : this.facade.step;
    const idx = order.indexOf(current);
    if (idx < 0) return 100;
    return Math.round(((idx + 1) / order.length) * 100);
  }

  get canGoNextStep(): boolean {
    switch (this.facade.step) {
      case 'upload':
        return !!this.facade.parsed && !this.facade.fileError;
      case 'mapping':
        return this.mappingStatus.complete;
      case 'validation':
        return !!this.facade.validation;
      case 'preview':
        return (this.facade.validation?.validRows ?? 0) > 0;
      case 'confirm':
        return this.facade.validation?.canImport === true && this.facade.confirmChecked;
      default:
        return false;
    }
  }

  get stepTitle(): string {
    const titles: Record<UserImportStep, string> = {
      upload: 'Importer un fichier CSV',
      mapping: 'Associer les colonnes',
      validation: 'Vérifier les données',
      preview: 'Prévisualiser l\'import',
      confirm: 'Confirmer l\'import',
      import: 'Import en cours',
      result: 'Import terminé'
    };
    return titles[this.facade.step];
  }

  get stepSubtitle(): string {
    const subs: Record<UserImportStep, string> = {
      upload: `Format .csv · max ${this.maxSizeLabel} · 500 lignes`,
      mapping: `${this.availableColumns.length} colonnes détectées dans votre fichier`,
      validation: 'Analyse ligne par ligne avant création des comptes',
      preview: `${this.facade.validation?.validRows ?? 0} utilisateur(s) prêt(s)`,
      confirm: 'Les comptes seront en attente de validation admin',
      import: 'Veuillez ne pas fermer cette page',
      result: 'Consultez le détail ci-dessous'
    };
    return subs[this.facade.step];
  }

  get coreMappingRows(): MappingRowDef[] {
    const rows: MappingRowDef[] = [
      { field: 'email', label: 'E-mail', icon: 'bi-envelope', required: true },
      { field: 'role', label: 'Rôle', icon: 'bi-person-badge', required: true }
    ];
    if (this.identityMode === 'full') {
      rows.unshift({ field: 'fullName', label: 'Nom complet', icon: 'bi-person-vcard', required: true });
    } else {
      rows.unshift(
        { field: 'firstName', label: 'Prénom', icon: 'bi-person', required: true },
        { field: 'lastName', label: 'Nom', icon: 'bi-person-lines-fill', required: true }
      );
    }
    return rows;
  }

  get optionalMappingRows(): MappingRowDef[] {
    return [
      { field: 'gender', label: 'Genre', icon: 'bi-gender-ambiguous', optional: true },
      { field: 'birthDate', label: 'Naissance', icon: 'bi-calendar3', optional: true },
      { field: 'discipline', label: 'Discipline', icon: 'bi-water', optional: true },
      { field: 'niveau', label: 'Niveau', icon: 'bi-bar-chart-steps', optional: true },
      { field: 'anciennete', label: 'Ancienneté', icon: 'bi-clock-history', optional: true }
    ];
  }

  get previewRows(): MappedUserRow[] {
    return this.facade.mappedRows
      .filter((r) => r.payload !== null)
      .slice(0, this.previewLimit);
  }

  get nextButtonLabel(): string {
    if (this.facade.step === 'confirm') return 'Lancer l\'import';
    return 'Continuer';
  }

  stepState(stepId: UserImportStep): 'done' | 'active' | 'upcoming' {
    const order: UserImportStep[] = ['upload', 'mapping', 'validation', 'preview', 'confirm', 'import'];
    const current = this.facade.step === 'result' ? 'import' : this.facade.step;
    const curIdx = order.indexOf(current);
    const stepIdx = order.indexOf(stepId);
    if (this.facade.step === 'result' || stepIdx < curIdx) return 'done';
    if (stepId === current) return 'active';
    return 'upcoming';
  }

  issueLabel(field: RowValidationIssue['field']): string {
    if (field === 'identity') return 'Identité';
    if (field === 'row') return 'Ligne';
    return this.fieldLabels[field as UserImportField] ?? field;
  }

  roleDisplay(role: string | undefined): string {
    const map: Record<string, string> = {
      SWIMMER: 'Nageur',
      COACH: 'Coach',
      VISITOR: 'Visiteur'
    };
    return role ? (map[role] ?? role) : '—';
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.applyFile(input.files?.[0] ?? null);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    this.applyFile(event.dataTransfer?.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  private async applyFile(file: File | null): Promise<void> {
    this.selectedFile = file;
    await this.facade.handleFileSelected(file);
    if (this.facade.parsed) this.syncIdentityMode();
    this.cdr.markForCheck();
  }

  private syncIdentityMode(): void {
    this.identityMode = this.columnMapper.detectIdentityMode(this.facade.fieldMap);
  }

  setIdentityMode(mode: 'full' | 'split'): void {
    if (this.identityMode === mode) return;
    this.identityMode = mode;
    this.facade.clearIdentityFields(mode);
    this.cdr.markForCheck();
  }

  onFieldSelect(field: UserImportField, value: string): void {
    this.facade.setFieldMapping(field, value || null);
    this.cdr.detectChanges();
  }

  getFieldValue(field: UserImportField): string {
    return this.facade.fieldMap[field] ?? '';
  }

  async next(): Promise<void> {
    if (this.facade.step === 'mapping' && !this.mappingStatus.complete) return;
    if (this.facade.step === 'upload') this.syncIdentityMode();
    await this.facade.goNext();
    this.cdr.markForCheck();
  }

  back(): void {
    this.facade.goBack();
    if (this.facade.step === 'mapping') this.syncIdentityMode();
    this.cdr.markForCheck();
  }

  cancel(): void {
    this.router.navigate(['/admin/utilisateurs']);
  }

  finish(): void {
    this.router.navigate(['/admin/utilisateurs']);
  }

  downloadTemplate(): void {
    const headers = ['nom_complet', 'email', 'role', 'genre', 'date_naissance', 'discipline', 'niveau', 'anciennete'];
    const sample = ['Ben Ali, Ahmed', 'ahmed.benali@example.com', 'SWIMMER', 'Homme', '2010-05-15', 'NATATION', 'MINIME', ''];
    const csv = [headers.join(';'), sample.join(';')].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele-import-utilisateurs-ftn.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

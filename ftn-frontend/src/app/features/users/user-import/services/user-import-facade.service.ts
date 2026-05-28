import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/user.service';
import { AdminUserCreateRequest } from '../../models/admin-user-create.model';
import {
  BulkImportResponse,
  ImportValidationSummary,
  MappedUserRow,
  ParsedCsvFile,
  UserImportStep,
  USER_IMPORT_STEP_ORDER
} from '../models/user-import.types';
import { UserCsvParserService } from './user-csv-parser.service';
import {
  FieldMap,
  UserImportColumnMapperService
} from './user-import-column-mapper.service';
import { UserImportValidatorService } from './user-import-validator.service';
import { UserImportSchemaGuardService } from './user-import-schema.guard';
import { USER_IMPORT_MAX_FILE_BYTES } from '../constants/user-import.constants';
import { IMPORT_STATUS_POLICY } from '../constants/user-import-field-rules';
import { UserImportField } from '../models/user-import.types';

@Injectable()
export class UserImportFacadeService {
  step: UserImportStep = 'upload';
  fileError = '';
  mappingWarnings: string[] = [];
  parsed: ParsedCsvFile | null = null;
  fieldMap: FieldMap = {};
  mappingReady = false;
  mappedRows: MappedUserRow[] = [];
  validation: ImportValidationSummary | null = null;
  importResult: BulkImportResponse | null = null;
  importing = false;
  confirmChecked = false;

  readonly statusPolicy = IMPORT_STATUS_POLICY;

  constructor(
    private readonly csvParser: UserCsvParserService,
    private readonly columnMapper: UserImportColumnMapperService,
    private readonly validator: UserImportValidatorService,
    private readonly schemaGuard: UserImportSchemaGuardService,
    private readonly userService: UserService
  ) {}

  get steps(): { id: UserImportStep; label: string; icon: string }[] {
    return [
      { id: 'upload', label: 'Fichier', icon: 'bi-cloud-upload' },
      { id: 'mapping', label: 'Colonnes', icon: 'bi-arrow-left-right' },
      { id: 'validation', label: 'Validation', icon: 'bi-shield-check' },
      { id: 'preview', label: 'Aperçu', icon: 'bi-eye' },
      { id: 'confirm', label: 'Confirmation', icon: 'bi-check2-circle' },
      { id: 'import', label: 'Import', icon: 'bi-box-arrow-in-down' }
    ];
  }

  stepIndex(): number {
    const idx = USER_IMPORT_STEP_ORDER.indexOf(this.step);
    return idx === -1 ? USER_IMPORT_STEP_ORDER.length : idx;
  }

  async handleFileSelected(file: File | null): Promise<void> {
    this.fileError = '';
    this.parsed = null;
    this.fieldMap = {};
    this.mappingReady = false;
    this.mappingWarnings = [];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.fileError = 'Seuls les fichiers .csv sont acceptés.';
      return;
    }
    if (file.size > USER_IMPORT_MAX_FILE_BYTES) {
      this.fileError = `Fichier trop volumineux (max ${USER_IMPORT_MAX_FILE_BYTES / (1024 * 1024)} Mo).`;
      return;
    }
    if (file.size === 0) {
      this.fileError = 'Le fichier est vide.';
      return;
    }

    try {
      const parsed = await this.csvParser.parseFile(file);
      const forbidden = this.schemaGuard.findForbiddenHeaders(parsed.headers);
      this.parsed = { ...parsed, forbiddenHeaders: forbidden };
      if (forbidden.length) {
        this.mappingWarnings = [
          `Colonnes de statut détectées (${forbidden.join(', ')}) : elles seront ignorées.`
        ];
      }
      if (parsed.rows.length === 0) {
        this.fileError = 'Le fichier ne contient aucune ligne de données.';
        this.parsed = null;
        return;
      }
      this.fieldMap = this.columnMapper.suggestFieldMap(parsed.headers);
      this.refreshMappingState();
    } catch (e: unknown) {
      this.fileError = e instanceof Error ? e.message : 'Impossible de lire le fichier CSV.';
    }
  }

  refreshMappingState(): void {
    const schema = this.schemaGuard.validateMappings(this.columnMapper.toMappings(this.fieldMap));
    this.mappingWarnings = [
      ...(this.parsed?.forbiddenHeaders?.length
        ? [`Colonnes statut ignorées : ${this.parsed.forbiddenHeaders.join(', ')}`]
        : []),
      ...schema.messages
    ];
    this.mappingReady = this.columnMapper.isFieldMapComplete(this.fieldMap);
  }

  canGoNext(): boolean {
    switch (this.step) {
      case 'upload':
        return !!this.parsed && !this.fileError;
      case 'mapping':
        return this.mappingReady;
      case 'validation':
        return !!this.validation;
      case 'preview':
        return (this.validation?.validRows ?? 0) > 0;
      case 'confirm':
        return this.validation?.canImport === true && this.confirmChecked;
      default:
        return false;
    }
  }

  async goNext(): Promise<void> {
    if (this.step === 'upload' && this.parsed) {
      this.step = 'mapping';
      this.refreshMappingState();
      return;
    }
    if (this.step === 'mapping' && this.parsed && this.columnMapper.isFieldMapComplete(this.fieldMap)) {
      await this.runValidation();
      this.step = 'validation';
      return;
    }
    if (this.step === 'validation') {
      this.step = 'preview';
      return;
    }
    if (this.step === 'preview') {
      this.confirmChecked = false;
      this.step = 'confirm';
      return;
    }
    if (this.step === 'confirm' && this.validation?.canImport) {
      this.step = 'import';
      await this.executeImport();
    }
  }

  goBack(): void {
    const navigable: UserImportStep[] = ['upload', 'mapping', 'validation', 'preview', 'confirm'];
    const idx = navigable.indexOf(this.step);
    if (idx > 0) {
      this.step = navigable[idx - 1];
    }
  }

  setFieldMapping(field: UserImportField, csvColumn: string | null): void {
    this.fieldMap = { ...this.columnMapper.setFieldMapping(this.fieldMap, field, csvColumn) };
    this.refreshMappingState();
  }

  clearIdentityFields(mode: 'full' | 'split'): void {
    if (mode === 'full') {
      delete this.fieldMap.firstName;
      delete this.fieldMap.lastName;
    } else {
      delete this.fieldMap.fullName;
    }
    this.refreshMappingState();
  }

  async runValidation(): Promise<void> {
    if (!this.parsed) return;
    const mappings = this.columnMapper.toMappings(this.fieldMap);
    this.mappedRows = this.validator.buildMappedRows(this.parsed, mappings);
    const users = await firstValueFrom(this.userService.getAllUsers());
    const emails = new Set(
      users.map((u: { email?: string }) => (u.email ?? '').trim().toLowerCase()).filter(Boolean)
    );
    this.validation = this.validator.validate(this.mappedRows, emails);
  }

  async executeImport(): Promise<void> {
    const payloads = this.mappedRows
      .map((r) => r.payload)
      .filter((p): p is AdminUserCreateRequest => p !== null);

    if (payloads.length === 0) return;

    this.importing = true;
    try {
      this.importResult = await firstValueFrom(this.userService.bulkImportUsers(payloads));
      this.step = 'result';
    } finally {
      this.importing = false;
    }
  }

  reset(): void {
    this.step = 'upload';
    this.fileError = '';
    this.mappingWarnings = [];
    this.parsed = null;
    this.fieldMap = {};
    this.mappingReady = false;
    this.mappedRows = [];
    this.validation = null;
    this.importResult = null;
    this.importing = false;
    this.confirmChecked = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  }
}

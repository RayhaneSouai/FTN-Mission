import { Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { UserService } from '../../services/user.service';
import { AdminUserCreateRequest } from '../../models/admin-user-create.model';
import {
  BulkImportResponse,
  ClubImportResolution,
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
import { EMAIL_PATTERN, USER_IMPORT_MAX_FILE_BYTES } from '../constants/user-import.constants';
import { IMPORT_STATUS_POLICY } from '../constants/user-import-field-rules';
import { UserImportField } from '../models/user-import.types';
import { ClubService } from '../../../clubs/services/club.service';
import { Club } from '../../../clubs/models/club.model';

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
  validating = false;
  validationProgress = 0;
  importResult: BulkImportResponse | null = null;
  clubResolution: ClubImportResolution | null = null;
  importing = false;
  confirmChecked = false;

  readonly statusPolicy = IMPORT_STATUS_POLICY;

  constructor(
    private readonly csvParser: UserCsvParserService,
    private readonly columnMapper: UserImportColumnMapperService,
    private readonly validator: UserImportValidatorService,
    private readonly schemaGuard: UserImportSchemaGuardService,
    private readonly userService: UserService,
    private readonly clubService: ClubService
  ) {}

  get steps(): { id: UserImportStep; label: string; icon: string }[] {
    return [
      { id: 'upload', label: 'Fichier', icon: 'bi-cloud-upload' },
      { id: 'club-info', label: 'Club', icon: 'bi-building' },
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
    this.clubResolution = null;
    if (!file) {
      return;
    }

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
      case 'club-info':
        return this.canConfirmClub();
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
      await this.prepareClubInfo();
      this.step = 'club-info';
      return;
    }
    if (this.step === 'club-info') {
      if (!(await this.ensureClubReady())) return;
      this.step = 'mapping';
      this.refreshMappingState();
      return;
    }
    if (this.step === 'mapping' && this.parsed && this.columnMapper.isFieldMapComplete(this.fieldMap)) {
      this.runValidation();
      this.step = 'preview';
      return;
    }
    if (this.step === 'preview') {
      this.confirmChecked = false;
      this.step = 'confirm';
      return;
    }
    if (this.step === 'confirm' && this.validation?.canImport && this.confirmChecked) {
      this.step = 'import';
      await this.executeImport();
    }
  }

  goBack(): void {
    const navigable: UserImportStep[] = ['upload', 'club-info', 'mapping', 'validation', 'preview', 'confirm'];
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

  runValidation(): void {
    if (!this.parsed) return;
    this.validation = null;
    this.validating = true;
    this.validationProgress = 0;
    try {
      const mappings = this.columnMapper.toMappings(this.fieldMap);
      this.mappedRows = this.validator.buildMappedRows(this.parsed, mappings);
      this.validation = this.buildFastValidation();
    } catch (e: unknown) {
      this.fileError = e instanceof Error ? e.message : 'Impossible de valider le fichier CSV.';
      this.validation = {
        totalRows: this.mappedRows.length,
        validRows: 0,
        errorRows: this.mappedRows.length,
        warningRows: 0,
        canImport: false,
        rows: []
      };
    } finally {
      this.validating = false;
      this.validationProgress = 100;
    }
  }

  private buildFastValidation(): ImportValidationSummary {
    let errorRows = 0;
    const rows: ImportValidationSummary['rows'] = [];
    const emailsInFile = new Map<string, number>();

    this.mappedRows.forEach((row) => {
      const issues: ImportValidationSummary['rows'][number]['issues'] = [];
      const email = (row.mapped.email ?? '').trim().toLowerCase();
      const role = this.validator.normalizeRole(row.mapped.role ?? '');

      if (!row.resolvedFirstName.trim() || !row.resolvedLastName.trim()) {
        issues.push({
          field: 'identity',
          severity: 'error',
          message: 'Identité manquante'
        });
      }
      if (!email || !EMAIL_PATTERN.test(email)) {
        issues.push({
          field: 'email',
          severity: 'error',
          message: 'Email obligatoire ou invalide'
        });
      } else {
        const firstRow = emailsInFile.get(email);
        if (firstRow !== undefined) {
          issues.push({
            field: 'email',
            severity: 'error',
            message: `Email en double avec la ligne ${firstRow}`
          });
        } else {
          emailsInFile.set(email, row.rowNumber);
        }
      }
      if (!role || role === 'ADMIN') {
        issues.push({
          field: 'role',
          severity: 'error',
          message: 'Rôle invalide'
        });
      }

      const hasCriticalError = issues.some((issue) => issue.severity === 'error');
      if (hasCriticalError) {
        errorRows++;
        row.payload = null;
      } else {
        const importRole = role as 'SWIMMER' | 'COACH' | 'VISITOR';
        row.mapped.role = importRole;
        row.payload = {
          firstName: row.resolvedFirstName.trim(),
          lastName: row.resolvedLastName.trim(),
          email,
          role: importRole,
          birthDate: row.mapped.birthDate || null,
          gender: row.mapped.gender || null,
          discipline: importRole === 'SWIMMER' ? row.mapped.discipline ?? null : null,
          niveau: importRole === 'SWIMMER' ? row.mapped.niveau ?? null : null,
          anciennete: importRole === 'COACH' && row.mapped.anciennete ? Number(row.mapped.anciennete) : null
        };
      }

      if (rows.length < 100 || hasCriticalError) {
        rows.push({
          rowNumber: row.rowNumber,
          email,
          displayName: `${row.resolvedFirstName} ${row.resolvedLastName}`.trim() || '—',
          issues,
          hasCriticalError
        });
      }
    });

    return {
      totalRows: this.mappedRows.length,
      validRows: this.mappedRows.length - errorRows,
      errorRows,
      warningRows: 0,
      canImport: this.mappedRows.length - errorRows > 0,
      rows: rows.slice(0, 100)
    };
  }

  async executeImport(): Promise<void> {
    if (!(await this.ensureClubReady())) {
      this.step = 'club-info';
      return;
    }

    const clubId = this.clubResolution?.clubId;
    const payloads = this.mappedRows
      .map((r) => r.payload)
      .filter((p): p is AdminUserCreateRequest => p !== null)
      .map((p) => ({ ...p, clubId }));

    if (payloads.length === 0) {
      // No users to import – move to result step with empty summary
      this.importResult = { successCount: 0, failureCount: 0, results: [] } as any;
      this.step = 'result';
      return;
    }

    this.importing = true;
    try {
      this.importResult = await firstValueFrom(this.userService.bulkImportUsers(payloads));
      this.step = 'result';
    } catch (e: unknown) {
      console.error('Import error:', e);
      this.fileError = e instanceof Error ? e.message : 'Une erreur est survenue lors de l\'import des utilisateurs.';
      this.step = 'confirm';
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
    this.validating = false;
    this.validationProgress = 0;
    this.importResult = null;
    this.clubResolution = null;
    this.importing = false;
    this.confirmChecked = false;
  }

  async prepareClubInfo(): Promise<void> {
    if (!this.parsed) return;
    this.clubResolution = await this.determineClub(this.parsed);
  }

  async determineClub(parsed: ParsedCsvFile): Promise<ClubImportResolution> {
    const detected = this.extractClubIdentifier(parsed);
    if (detected.error) {
      return {
        clubName: '',
        needsCreation: false,
        createIfMissing: false,
        error: detected.error
      };
    }

    if (detected.clubId !== undefined) {
      return this.resolveClubById(detected.clubId);
    }

    const clubName = detected.clubName?.trim() ?? '';
    if (!clubName) {
      return {
        clubName: '',
        needsCreation: false,
        createIfMissing: false,
        error: 'Nom du club manquant : ajoutez une colonne club, club_name ou nom_club au CSV.'
      };
    }

    try {
      const club = await firstValueFrom(this.clubService.findByName(clubName).pipe(timeout(4000)));
      if (club?.id) {
        return {
          clubId: club.id,
          clubName: club.name,
          needsCreation: false,
          createIfMissing: false,
          error: ''
        };
      }
    } catch (err) {
      console.warn('Could not check club existence. Import will require explicit confirmation.', err);
    }

    return {
      clubName,
      needsCreation: true,
      createIfMissing: false,
      error: ''
    };
  }

  setCreateClubIfMissing(value: boolean): void {
    if (!this.clubResolution?.needsCreation) return;
    this.clubResolution = { ...this.clubResolution, createIfMissing: value, error: '' };
  }

  canConfirmClub(): boolean {
    if (!this.clubResolution || this.clubResolution.error) return false;
    if (this.clubResolution.clubId) return true;
    return this.clubResolution.needsCreation && this.clubResolution.createIfMissing;
  }

  private async ensureClubReady(): Promise<boolean> {
    if (!this.clubResolution || this.clubResolution.error) return false;
    if (this.clubResolution.clubId) return true;

    if (!this.clubResolution.needsCreation || !this.clubResolution.createIfMissing) {
      return false;
    }

    try {
      const created = await firstValueFrom(
        this.clubService.createByName(this.clubResolution.clubName).pipe(timeout(5000))
      );
      if (!created.id) {
        this.clubResolution = {
          ...this.clubResolution,
          error: 'Le club a été créé mais son identifiant est introuvable.'
        };
        return false;
      }

      this.clubResolution = {
        clubId: created.id,
        clubName: created.name,
        needsCreation: false,
        createIfMissing: false,
        error: ''
      };
      return true;
    } catch (e: unknown) {
      this.clubResolution = {
        ...this.clubResolution,
        error: e instanceof Error ? e.message : 'Impossible de créer le club.'
      };
      return false;
    }
  }

  private async resolveClubById(clubId: number): Promise<ClubImportResolution> {
    try {
      const clubs = await firstValueFrom(this.clubService.getAll().pipe(timeout(4000)));
      const club = clubs.find((c: Club) => c.id === clubId);
      if (club) {
        return {
          clubId: club.id,
          clubName: club.name,
          needsCreation: false,
          createIfMissing: false,
          error: ''
        };
      }
    } catch (err) {
      console.warn('Could not resolve club by id.', err);
    }

    return {
      clubName: '',
      needsCreation: false,
      createIfMissing: false,
      error: `Club introuvable pour l'identifiant ${clubId}.`
    };
  }

  private extractClubIdentifier(parsed: ParsedCsvFile): {
    clubId?: number;
    clubName?: string;
    error: string;
  } {
    const clubIdHeader = this.findHeader(parsed.headers, ['club_id', 'clubid', 'id_club', 'identifiant_club']);
    const clubNameHeader = this.findHeader(parsed.headers, ['club', 'club_name', 'clubname', 'nom_club', 'nom du club']);
    const header = clubIdHeader ?? clubNameHeader;

    if (!header) {
      return { error: 'Nom du club manquant : le CSV doit contenir une colonne club, club_name ou nom_club.' };
    }

    const columnIndex = parsed.headers.indexOf(header);
    const values = parsed.rows
      .map((row) => (row[columnIndex] ?? '').trim())
      .filter(Boolean);

    if (values.length === 0) {
      return { error: `La colonne ${header} ne contient aucun club.` };
    }

    const unique = Array.from(new Map(values.map((value) => [this.normalizeClubValue(value), value])).values());
    if (unique.length > 1) {
      return { error: 'Le fichier contient plusieurs clubs. Importez un fichier distinct pour chaque club.' };
    }

    const value = unique[0];
    if (clubIdHeader) {
      const clubId = Number(value);
      if (!Number.isInteger(clubId) || clubId <= 0) {
        return { error: `Identifiant de club invalide : ${value}.` };
      }
      return { clubId, error: '' };
    }

    return { clubName: value, error: '' };
  }

  private findHeader(headers: string[], aliases: string[]): string | null {
    return headers.find((header) => aliases.includes(this.normalizeClubValue(header))) ?? null;
  }

  private normalizeClubValue(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  }
}

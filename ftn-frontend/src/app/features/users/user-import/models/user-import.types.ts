import { AdminUserCreateRequest } from '../../models/admin-user-create.model';

export type UserImportField =
  | 'fullName'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'role'
  | 'gender'
  | 'birthDate'
  | 'discipline'
  | 'niveau'
  | 'anciennete'
  | 'skip';

export type UserImportStep =
  | 'upload'
  | 'mapping'
  | 'validation'
  | 'preview'
  | 'confirm'
  | 'import'
  | 'result';

export type ValidationSeverity = 'error' | 'warning';

export interface ParsedCsvFile {
  fileName: string;
  fileSize: number;
  headers: string[];
  rows: string[][];
  forbiddenHeaders: string[];
}

export interface ColumnMapping {
  field: UserImportField;
  csvColumn: string | null;
}

export interface MappedUserRow {
  rowNumber: number;
  raw: Record<string, string>;
  mapped: Partial<Record<UserImportField, string>>;
  resolvedFirstName: string;
  resolvedLastName: string;
  payload: AdminUserCreateRequest | null;
}

export interface RowValidationIssue {
  field: UserImportField | 'row' | 'identity';
  severity: ValidationSeverity;
  message: string;
}

export interface RowValidationResult {
  rowNumber: number;
  email: string;
  displayName: string;
  issues: RowValidationIssue[];
  hasCriticalError: boolean;
}

export interface ImportValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  canImport: boolean;
  rows: RowValidationResult[];
}

export interface BulkImportRowResult {
  rowNumber: number;
  email: string;
  success: boolean;
  message: string;
}

export interface BulkImportResponse {
  total: number;
  successCount: number;
  failureCount: number;
  results: BulkImportRowResult[];
}

export const USER_IMPORT_FIELD_LABELS: Record<UserImportField, string> = {
  fullName: 'Nom complet',
  firstName: 'Prénom',
  lastName: 'Nom',
  email: 'Email',
  role: 'Rôle',
  gender: 'Genre',
  birthDate: 'Date de naissance',
  discipline: 'Discipline',
  niveau: 'Niveau / catégorie',
  anciennete: 'Ancienneté (coach)',
  skip: '— Ignorer —'
};

export const USER_IMPORT_STEP_ORDER: UserImportStep[] = [
  'upload',
  'mapping',
  'validation',
  'preview',
  'confirm',
  'import',
  'result'
];

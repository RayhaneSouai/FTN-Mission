import { Injectable } from '@angular/core';
import { AdminUserCreateRequest } from '../../models/admin-user-create.model';
import {
  ImportValidationSummary,
  MappedUserRow,
  RowValidationIssue,
  RowValidationResult
} from '../models/user-import.types';
import {
  EMAIL_PATTERN,
  ImportableRole,
  VALID_DISCIPLINES,
  VALID_GENDERS,
  VALID_NIVEAUX,
  VALID_ROLES
} from '../constants/user-import.constants';
import {
  isFieldAllowedForRole,
  isFieldRequiredForRole
} from '../constants/user-import-field-rules';
import { UserImportRowBuilderService } from './user-import-row-builder.service';
import { ParsedCsvFile } from '../models/user-import.types';
import { ColumnMapping } from '../models/user-import.types';

@Injectable({ providedIn: 'root' })
export class UserImportValidatorService {
  constructor(private readonly rowBuilder: UserImportRowBuilderService) {}

  buildMappedRows(parsed: ParsedCsvFile, mappings: ColumnMapping[]): MappedUserRow[] {
    return this.rowBuilder.build(parsed, mappings);
  }

  validate(rows: MappedUserRow[], existingEmails: Set<string>): ImportValidationSummary {
    const emailInFile = new Map<string, number>();
    const results: RowValidationResult[] = [];

    for (const row of rows) {
      const issues: RowValidationIssue[] = [];
      const emailRaw = (row.mapped.email ?? '').trim().toLowerCase();

      this.validateIdentity(row, issues);
      this.validateEmail(row, emailRaw, issues);
      this.validateRole(row, issues);
      this.validateDuplicates(emailRaw, emailInFile, row.rowNumber, issues);
      this.validateExistingEmail(emailRaw, existingEmails, issues);

      const roleRaw = (row.mapped.role ?? '').trim();
      const role = roleRaw ? this.normalizeRole(roleRaw) : null;
      if (roleRaw && !role) {
        issues.push({
          field: 'role',
          severity: 'error',
          message: 'Rôle invalide (SWIMMER, COACH ou VISITOR)'
        });
      } else if (role === 'ADMIN') {
        issues.push({
          field: 'role',
          severity: 'error',
          message: 'Le rôle Administrateur est interdit à l\'import CSV'
        });
      } else if (role) {
        row.mapped.role = role;
        this.validateRoleSpecific(row, role, issues);
      }

      const payload = issues.some((i) => i.severity === 'error')
        ? null
        : this.toPayload(row, role as ImportableRole);

      row.payload = payload;

      results.push({
        rowNumber: row.rowNumber,
        email: emailRaw,
        displayName: `${row.resolvedFirstName} ${row.resolvedLastName}`.trim() || '—',
        issues,
        hasCriticalError: issues.some((i) => i.severity === 'error')
      });
    }

    const errorRows = results.filter((r) => r.hasCriticalError).length;
    const warningRows = results.filter(
      (r) => !r.hasCriticalError && r.issues.some((i) => i.severity === 'warning')
    ).length;

    return {
      totalRows: results.length,
      validRows: results.length - errorRows,
      errorRows,
      warningRows,
      canImport: errorRows === 0 && results.length > 0,
      rows: results
    };
  }

  private validateIdentity(row: MappedUserRow, issues: RowValidationIssue[]): void {
    if (!row.resolvedFirstName.trim()) {
      issues.push({
        field: 'identity',
        severity: 'error',
        message: 'Prénom manquant (nom complet ou colonne prénom)'
      });
    }
    if (!row.resolvedLastName.trim()) {
      issues.push({
        field: 'identity',
        severity: 'error',
        message: 'Nom manquant (nom complet ou colonne nom)'
      });
    }
  }

  private validateEmail(row: MappedUserRow, email: string, issues: RowValidationIssue[]): void {
    if (!(row.mapped.email ?? '').trim()) {
      issues.push({ field: 'email', severity: 'error', message: 'Email obligatoire' });
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      issues.push({ field: 'email', severity: 'error', message: 'Format d\'email invalide' });
    }
  }

  private validateRole(row: MappedUserRow, issues: RowValidationIssue[]): void {
    const raw = (row.mapped.role ?? '').trim();
    if (!raw) {
      issues.push({ field: 'role', severity: 'error', message: 'Rôle obligatoire' });
    }
  }

  private validateDuplicates(
    email: string,
    emailInFile: Map<string, number>,
    rowNumber: number,
    issues: RowValidationIssue[]
  ): void {
    if (!email || !EMAIL_PATTERN.test(email)) return;
    const first = emailInFile.get(email);
    if (first !== undefined) {
      issues.push({
        field: 'email',
        severity: 'error',
        message: `Email en double avec la ligne ${first}`
      });
    } else {
      emailInFile.set(email, rowNumber);
    }
  }

  private validateExistingEmail(
    email: string,
    existingEmails: Set<string>,
    issues: RowValidationIssue[]
  ): void {
    if (email && existingEmails.has(email)) {
      issues.push({
        field: 'email',
        severity: 'error',
        message: 'Cet email existe déjà dans la base'
      });
    }
  }

  private validateRoleSpecific(
    row: MappedUserRow,
    role: ImportableRole,
    issues: RowValidationIssue[]
  ): void {
    const fields = ['gender', 'birthDate', 'discipline', 'niveau', 'anciennete'] as const;

    for (const field of fields) {
      const value = (row.mapped[field] ?? '').trim();
      if (!isFieldAllowedForRole(field, role) && value) {
        issues.push({
          field,
          severity: 'warning',
          message: `Champ ignoré pour le rôle ${role}`
        });
        continue;
      }
      if (isFieldRequiredForRole(field, role) && !value) {
        issues.push({
          field,
          severity: 'error',
          message: `${field} obligatoire pour ${this.roleLabel(role)}`
        });
        continue;
      }
    }

    const gender = this.normalizeGender(row.mapped.gender ?? '');
    if (gender) row.mapped.gender = gender;
    if (row.mapped.gender && !VALID_GENDERS.includes(gender as typeof VALID_GENDERS[number])) {
      issues.push({ field: 'gender', severity: 'error', message: 'Genre invalide (Homme / Femme)' });
    }

    const birthDate = this.normalizeDate(row.mapped.birthDate ?? '');
    if (birthDate) row.mapped.birthDate = birthDate;
    if (birthDate && !this.isValidDate(birthDate)) {
      issues.push({ field: 'birthDate', severity: 'error', message: 'Date de naissance invalide' });
    }

    if (role === 'SWIMMER') {
      const discipline = this.normalizeDiscipline(row.mapped.discipline ?? '');
      const niveau = this.normalizeNiveau(row.mapped.niveau ?? '');
      if (discipline) row.mapped.discipline = discipline;
      if (niveau) row.mapped.niveau = niveau;
      if (discipline && !VALID_DISCIPLINES.includes(discipline as typeof VALID_DISCIPLINES[number])) {
        issues.push({ field: 'discipline', severity: 'error', message: 'Discipline invalide' });
      }
      if (niveau && !VALID_NIVEAUX.includes(niveau as typeof VALID_NIVEAUX[number])) {
        issues.push({ field: 'niveau', severity: 'error', message: 'Niveau / catégorie invalide' });
      }
    }

    if (role === 'COACH') {
      const anc = (row.mapped.anciennete ?? '').trim();
      if (anc && (isNaN(Number(anc)) || Number(anc) < 0)) {
        issues.push({ field: 'anciennete', severity: 'error', message: 'Ancienneté : nombre ≥ 0 requis' });
      }
    }
  }

  private toPayload(row: MappedUserRow, role: ImportableRole): AdminUserCreateRequest {
    const base: AdminUserCreateRequest = {
      firstName: row.resolvedFirstName.trim(),
      lastName: row.resolvedLastName.trim(),
      email: row.mapped.email!.trim().toLowerCase(),
      role,
      birthDate: row.mapped.birthDate || null,
      gender: row.mapped.gender || null,
      discipline: null,
      niveau: null,
      anciennete: null
    };
    if (role === 'SWIMMER') {
      base.discipline = row.mapped.discipline ?? null;
      base.niveau = row.mapped.niveau ?? null;
    } else if (role === 'COACH') {
      base.anciennete = Number(row.mapped.anciennete);
    }
    return base;
  }

  private roleLabel(role: ImportableRole): string {
    const map: Record<ImportableRole, string> = {
      SWIMMER: 'Nageur',
      COACH: 'Coach',
      VISITOR: 'Visiteur'
    };
    return map[role];
  }

  normalizeRole(raw: string): ImportableRole | 'ADMIN' | null {
    const n = raw
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const map: Record<string, ImportableRole | 'ADMIN'> = {
      SWIMMER: 'SWIMMER',
      NAGEUR: 'SWIMMER',
      NAGEUSE: 'SWIMMER',
      COACH: 'COACH',
      ENTRAINEUR: 'COACH',
      ENTRAINER: 'COACH',
      VISITOR: 'VISITOR',
      VISITEUR: 'VISITOR',
      ADMIN: 'ADMIN',
      ADMINISTRATEUR: 'ADMIN'
    };
    return map[n] ?? (VALID_ROLES.includes(n as ImportableRole) ? (n as ImportableRole) : null);
  }

  private normalizeGender(raw: string): string | null {
    const n = raw.trim().toUpperCase();
    if (['HOMME', 'H', 'M', 'MALE', 'MASCULIN'].includes(n)) return 'HOMME';
    if (['FEMME', 'F', 'FEMALE', 'FEMININ'].includes(n)) return 'FEMME';
    return VALID_GENDERS.includes(n as typeof VALID_GENDERS[number]) ? n : null;
  }

  private normalizeDiscipline(raw: string): string | null {
    const n = raw.trim().toUpperCase().replace(/\s+/g, '_');
    const aliases: Record<string, string> = {
      NATATION: 'NATATION',
      EAU_LIBRE: 'EAU_LIBRE',
      EAU: 'EAU_LIBRE',
      WATER_POLO: 'WATER_POLO',
      WATERPOLO: 'WATER_POLO',
      PLONGEON: 'PLONGEON',
      NAGE_SYNCHRONISEE: 'NAGE_SYNCHRONISEE',
      SYNCHRO: 'NAGE_SYNCHRONISEE'
    };
    return aliases[n] ?? (VALID_DISCIPLINES.includes(n as typeof VALID_DISCIPLINES[number]) ? n : null);
  }

  private normalizeNiveau(raw: string): string | null {
    const n = raw.trim().toUpperCase();
    return VALID_NIVEAUX.includes(n as typeof VALID_NIVEAUX[number]) ? n : null;
  }

  private normalizeDate(raw: string): string | null {
    const v = raw.trim();
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const fr = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (fr) {
      return `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
    }
    return null;
  }

  private isValidDate(iso: string): boolean {
    return !isNaN(new Date(iso).getTime());
  }
}

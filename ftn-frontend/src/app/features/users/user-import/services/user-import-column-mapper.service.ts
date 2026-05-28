import { Injectable } from '@angular/core';
import { ColumnMapping, UserImportField } from '../models/user-import.types';
import { USER_IMPORT_FIELD_LABELS } from '../models/user-import.types';
import { UserImportSchemaGuardService } from './user-import-schema.guard';

const FIELD_ALIASES: Record<UserImportField, string[]> = {
  fullName: ['nom_complet', 'fullname', 'full_name', 'full name', 'nom complet', 'name', 'nom_prenom', 'identite'],
  firstName: ['prenom', 'prénom', 'firstname', 'first_name', 'first name'],
  lastName: ['nom', 'lastname', 'last_name', 'last name', 'nom_famille', 'nom_de_famille'],
  email: ['email', 'mail', 'e-mail', 'courriel', 'adresse_email'],
  role: ['role', 'rôle', 'type', 'profil', 'user_role'],
  gender: ['genre', 'gender', 'sexe', 'sex'],
  birthDate: ['birthdate', 'birth_date', 'date_naissance', 'naissance', 'dob', 'date de naissance'],
  discipline: ['discipline', 'sport', 'specialite', 'spécialité'],
  niveau: ['niveau', 'level', 'categorie', 'catégorie', 'category'],
  anciennete: ['anciennete', 'ancienneté', 'seniority', 'experience', 'expérience', 'annees_experience'],
  skip: []
};

const MAPPABLE_FIELDS: UserImportField[] = [
  'fullName',
  'firstName',
  'lastName',
  'email',
  'role',
  'gender',
  'birthDate',
  'discipline',
  'niveau',
  'anciennete'
];

export type FieldMap = Partial<Record<UserImportField, string>>;

@Injectable({ providedIn: 'root' })
export class UserImportColumnMapperService {
  readonly mappableFields = MAPPABLE_FIELDS;

  constructor(private readonly schemaGuard: UserImportSchemaGuardService) {}

  suggestFieldMap(headers: string[]): FieldMap {
    const used = new Set<string>();
    const map: FieldMap = {};

    const assignField = (field: UserImportField): void => {
      const aliases = FIELD_ALIASES[field];
      for (const header of headers) {
        if (used.has(header) || this.schemaGuard.isForbiddenColumn(header)) continue;
        const norm = this.normalize(header);
        if (aliases.some((a) => this.matchesAlias(norm, a))) {
          used.add(header);
          map[field] = header;
          return;
        }
      }
    };

    const priority: UserImportField[] = [
      'fullName',
      'email',
      'role',
      'firstName',
      'lastName',
      'gender',
      'birthDate',
      'discipline',
      'niveau',
      'anciennete'
    ];

    for (const field of priority) {
      assignField(field);
    }

    return map;
  }

  toMappings(fieldMap: FieldMap): ColumnMapping[] {
    return MAPPABLE_FIELDS.filter((f) => fieldMap[f])
      .map((field) => ({ field, csvColumn: fieldMap[field]! }));
  }

  getMappingForField(fieldMap: FieldMap, field: UserImportField): string | null {
    return fieldMap[field] ?? null;
  }

  setFieldMapping(fieldMap: FieldMap, field: UserImportField, csvColumn: string | null): FieldMap {
    const next: FieldMap = { ...fieldMap };

    if (!csvColumn) {
      delete next[field];
      return next;
    }

    if (this.schemaGuard.isForbiddenColumn(csvColumn)) {
      return next;
    }

    for (const f of MAPPABLE_FIELDS) {
      if (f !== field && next[f] === csvColumn) {
        delete next[f];
      }
    }

    next[field] = csvColumn;
    return next;
  }

  isFieldMapComplete(fieldMap: FieldMap): boolean {
    return this.getMappingStatus(fieldMap).complete;
  }

  /** @deprecated use isFieldMapComplete */
  isMappingComplete(mappings: ColumnMapping[]): boolean {
    return this.isFieldMapComplete(this.fromMappings(mappings));
  }

  /** @deprecated use getMappingForField(fieldMap) */
  getMappingForFieldFromList(mappings: ColumnMapping[], field: UserImportField): string | null {
    return mappings.find((m) => m.field === field)?.csvColumn ?? null;
  }

  /** @deprecated use setFieldMapping */
  updateMapping(mappings: ColumnMapping[], field: UserImportField, csvColumn: string | null): ColumnMapping[] {
    const map = this.fromMappings(mappings);
    return this.toMappings(this.setFieldMapping(map, field, csvColumn));
  }

  fromMappings(mappings: ColumnMapping[]): FieldMap {
    const map: FieldMap = {};
    for (const m of mappings) {
      if (m.csvColumn && m.field !== 'skip') {
        map[m.field] = m.csvColumn;
      }
    }
    return map;
  }

  getMappingStatus(fieldMap: FieldMap): {
    email: boolean;
    role: boolean;
    identity: boolean;
    complete: boolean;
    missing: string[];
  } {
    const email = !!fieldMap.email;
    const role = !!fieldMap.role;
    const identity = !!fieldMap.fullName || (!!fieldMap.firstName && !!fieldMap.lastName);
    const missing: string[] = [];
    if (!email) missing.push('Email');
    if (!role) missing.push('Rôle');
    if (!identity) missing.push('Identité (nom complet ou prénom + nom)');
    return {
      email,
      role,
      identity,
      complete: email && role && identity,
      missing
    };
  }

  detectIdentityMode(fieldMap: FieldMap): 'full' | 'split' {
    if (fieldMap.fullName) return 'full';
    if (fieldMap.firstName || fieldMap.lastName) return 'split';
    return 'full';
  }

  fieldLabel(field: UserImportField): string {
    return USER_IMPORT_FIELD_LABELS[field];
  }

  private matchesAlias(headerNorm: string, alias: string): boolean {
    const aliasNorm = this.normalize(alias);
    if (headerNorm === aliasNorm) return true;
    if (aliasNorm.length <= 4) {
      return (
        headerNorm === aliasNorm ||
        headerNorm.startsWith(aliasNorm + '_') ||
        headerNorm.endsWith('_' + aliasNorm)
      );
    }
    return headerNorm.includes(aliasNorm);
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_');
  }
}

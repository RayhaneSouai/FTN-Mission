import { Injectable } from '@angular/core';
import { FORBIDDEN_CSV_COLUMN_ALIASES } from '../constants/user-import-field-rules';
import { ColumnMapping } from '../models/user-import.types';

@Injectable({ providedIn: 'root' })
export class UserImportSchemaGuardService {
  findForbiddenHeaders(headers: string[]): string[] {
    return headers.filter((h) => this.isForbiddenColumn(h));
  }

  isForbiddenColumn(header: string): boolean {
    const norm = this.normalize(header);
    return FORBIDDEN_CSV_COLUMN_ALIASES.some((a) => norm === this.normalize(a));
  }

  validateMappings(mappings: ColumnMapping[]): { ok: boolean; messages: string[] } {
    const messages: string[] = [];
    const mappedForbidden = mappings.filter(
      (m) => m.csvColumn && m.field !== 'skip' && this.isForbiddenColumn(m.csvColumn)
    );
    if (mappedForbidden.length) {
      messages.push(
        `Colonnes interdites mappées : ${mappedForbidden.map((m) => m.csvColumn).join(', ')}. Le statut se gère uniquement dans l'interface admin.`
      );
    }
    return { ok: messages.length === 0, messages };
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

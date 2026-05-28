import { Injectable } from '@angular/core';

export interface ParsedFullName {
  firstName: string;
  lastName: string;
  strategy: 'single' | 'comma' | 'split';
}

/**
 * Dérive firstName / lastName à partir d'une colonne « nom complet ».
 * Stratégies : "Nom, Prénom" | "Prénom Nom" (dernier token = nom de famille).
 */
@Injectable({ providedIn: 'root' })
export class UserFullNameParserService {
  parse(fullName: string): ParsedFullName | null {
    const raw = fullName.trim().replace(/\s+/g, ' ');
    if (!raw) return null;

    if (raw.includes(',')) {
      const [last, first] = raw.split(',').map((p) => p.trim());
      if (first && last) {
        return { firstName: first, lastName: last, strategy: 'comma' };
      }
    }

    const parts = raw.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: parts[0], strategy: 'single' };
    }

    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    return { firstName, lastName, strategy: 'split' };
  }
}

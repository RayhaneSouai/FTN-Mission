import { Injectable } from '@angular/core';
import { ColumnMapping, MappedUserRow, ParsedCsvFile, UserImportField } from '../models/user-import.types';
import { UserFullNameParserService } from './user-full-name.parser';
import { UserImportColumnMapperService } from './user-import-column-mapper.service';

@Injectable({ providedIn: 'root' })
export class UserImportRowBuilderService {
  constructor(
    private readonly mapper: UserImportColumnMapperService,
    private readonly fullNameParser: UserFullNameParserService
  ) {}

  build(parsed: ParsedCsvFile, mappings: ColumnMapping[]): MappedUserRow[] {
    return parsed.rows.map((cells, index) => {
      const rowNumber = index + 2;
      const raw: Record<string, string> = {};
      parsed.headers.forEach((h, i) => (raw[h] = cells[i] ?? ''));

      const mapped: Partial<Record<UserImportField, string>> = {};
      for (const m of mappings) {
        if (!m.csvColumn || m.field === 'skip') continue;
        const colIndex = parsed.headers.indexOf(m.csvColumn);
        if (colIndex >= 0) {
          mapped[m.field] = (cells[colIndex] ?? '').trim();
        }
      }

      const { firstName, lastName } = this.resolveIdentity(mapped);

      return {
        rowNumber,
        raw,
        mapped,
        resolvedFirstName: firstName,
        resolvedLastName: lastName,
        payload: null
      };
    });
  }

  private resolveIdentity(mapped: Partial<Record<UserImportField, string>>): {
    firstName: string;
    lastName: string;
  } {
    const fullNameCol = mapped.fullName?.trim();
    if (fullNameCol) {
      const parsed = this.fullNameParser.parse(fullNameCol);
      if (parsed) {
        return { firstName: parsed.firstName, lastName: parsed.lastName };
      }
    }

    return {
      firstName: (mapped.firstName ?? '').trim(),
      lastName: (mapped.lastName ?? '').trim()
    };
  }
}

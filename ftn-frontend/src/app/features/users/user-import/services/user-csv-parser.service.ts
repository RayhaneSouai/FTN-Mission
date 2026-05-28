import { Injectable } from '@angular/core';
import { ParsedCsvFile } from '../models/user-import.types';
import { USER_IMPORT_MAX_ROWS } from '../constants/user-import.constants';

@Injectable({ providedIn: 'root' })
export class UserCsvParserService {
  async parseFile(file: File): Promise<ParsedCsvFile> {
    let text = await file.text();
    text = text.replace(/^\uFEFF/, '');
    const parsed = this.parseCsvText(text);
    if (parsed.rows.length > USER_IMPORT_MAX_ROWS) {
      throw new Error(`Le fichier dépasse la limite de ${USER_IMPORT_MAX_ROWS} lignes.`);
    }
    if (parsed.headers.length === 0) {
      throw new Error('Le fichier CSV ne contient pas d\'en-têtes.');
    }
    return {
      fileName: file.name,
      fileSize: file.size,
      headers: parsed.headers,
      rows: parsed.rows,
      forbiddenHeaders: []
    };
  }

  parseCsvText(text: string): { headers: string[]; rows: string[][] } {
    const lines = this.splitLines(text.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }
    const headers = this.parseLine(lines[0]).map((h) => h.trim()).filter(Boolean);
    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = this.parseLine(line);
      while (cells.length < headers.length) {
        cells.push('');
      }
      rows.push(cells.slice(0, headers.length));
    }
    return { headers, rows };
  }

  private splitLines(text: string): string[] {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  }

  private parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((ch === ',' || ch === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }
}

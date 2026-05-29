import { Injectable } from '@angular/core';
import { ParsedCsvFile } from '../models/user-import.types';
import { USER_IMPORT_MAX_ROWS } from '../constants/user-import.constants';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserCsvParserService {
  private progressSubject = new Subject<number>();
  progress$ = this.progressSubject.asObservable();

  async parseFile(file: File): Promise<ParsedCsvFile> {
    const text = await file.text();
    this.progressSubject.next(30);

    const parsed = await this.parseText(text);
    this.progressSubject.next(90);

    this.progressSubject.next(100);
    return {
      fileName: file.name,
      fileSize: file.size,
      headers: parsed.headers,
      rows: parsed.rows,
      forbiddenHeaders: []
    };
  }

  private parseText(text: string): Promise<{ headers: string[]; rows: string[][] }> {
    if (typeof Worker === 'undefined') {
      return Promise.resolve(this.parseTextSync(text));
    }

    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./user-csv-parser.worker', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => {
        worker.terminate();
        if (data.error) {
          reject(new Error(data.error));
          return;
        }
        resolve({ headers: data.headers, rows: data.rows });
      };
      worker.onerror = () => {
        worker.terminate();
        reject(new Error('Impossible de lire le fichier CSV.'));
      };
      worker.postMessage({ text, maxRows: USER_IMPORT_MAX_ROWS });
    });
  }

  private parseTextSync(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);

    if (lines.length === 0) {
      throw new Error('Le fichier CSV est vide.');
    }

    const headers = this.parseLine(lines[0]).map(h => h.trim()).filter(Boolean);
    if (headers.length === 0) {
      throw new Error('Le fichier CSV ne contient pas d\'en-têtes.');
    }

    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const cells = this.parseLine(line);
      while (cells.length < headers.length) {
        cells.push('');
      }
      rows.push(cells.slice(0, headers.length));
      if (rows.length > USER_IMPORT_MAX_ROWS) {
        throw new Error(`Le fichier dépasse la limite de ${USER_IMPORT_MAX_ROWS} lignes.`);
      }
    }

    return { headers, rows };
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

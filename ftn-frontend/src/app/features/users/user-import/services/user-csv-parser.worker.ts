/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  try {
    const text: string = data.text;
    const maxRows: number = data.maxRows;
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);

    if (lines.length === 0) {
      postMessage({ error: 'Le fichier CSV est vide.' });
      return;
    }

    let headerLine = lines[0];
// Remove UTF-8 BOM if present
if (headerLine.charCodeAt(0) === 0xFEFF) {
  headerLine = headerLine.slice(1);
}
const headers = parseLine(headerLine).map(h => h.trim()).filter(Boolean);
    if (headers.length === 0) {
      postMessage({ error: 'Le fichier CSV ne contient pas d\'en-têtes.' });
      return;
    }

    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const cells = parseLine(line);
      while (cells.length < headers.length) {
        cells.push('');
      }
      rows.push(cells.slice(0, headers.length));
      if (rows.length > maxRows) {
        postMessage({ error: `Le fichier dépasse la limite de ${maxRows} lignes.` });
        return;
      }
    }

    postMessage({ headers, rows });
  } catch {
    postMessage({ error: 'Impossible de lire le fichier CSV.' });
  }
});

function parseLine(line: string): string[] {
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

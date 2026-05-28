export type ChartRangePreset = '7d' | '30d' | '3m' | '6m' | '1y' | 'custom';

export interface ChartDateRange {
  preset: ChartRangePreset;
  start: Date;
  end: Date;
  label: string;
}

export interface ChartRangePresetOption {
  preset: ChartRangePreset;
  label: string;
}

export const CHART_RANGE_PRESETS: ChartRangePresetOption[] = [
  { preset: '7d', label: '7 jours' },
  { preset: '30d', label: '30 jours' },
  { preset: '3m', label: '3 mois' },
  { preset: '6m', label: '6 mois' },
  { preset: '1y', label: '1 an' },
  { preset: 'custom', label: 'Personnalisé' }
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function presetLabel(preset: ChartRangePreset, start: Date, end: Date): string {
  switch (preset) {
    case '7d':
      return '7 derniers jours';
    case '30d':
      return '30 derniers jours';
    case '3m':
      return '3 derniers mois';
    case '6m':
      return '6 derniers mois';
    case '1y':
      return '12 derniers mois';
    case 'custom':
      return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  }
}

export function resolveChartDateRange(
  preset: ChartRangePreset,
  customStart?: Date,
  customEnd?: Date
): ChartDateRange {
  const today = startOfDay(new Date());
  let start: Date;
  let end = endOfDay(today);

  switch (preset) {
    case '7d':
      start = startOfDay(addDays(today, -6));
      break;
    case '30d':
      start = startOfDay(addDays(today, -29));
      break;
    case '3m':
      start = startOfDay(addMonths(today, -3));
      break;
    case '6m':
      start = startOfDay(addMonths(today, -6));
      break;
    case '1y':
      start = startOfDay(addMonths(today, -12));
      break;
    case 'custom': {
      const rawStart = customStart ? startOfDay(customStart) : startOfDay(addDays(today, -29));
      const rawEnd = customEnd ? endOfDay(customEnd) : end;
      start = rawStart;
      end = rawEnd > rawStart ? rawEnd : endOfDay(rawStart);
      break;
    }
  }

  return {
    preset,
    start,
    end,
    label: presetLabel(preset, start, end)
  };
}

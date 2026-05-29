import { ChartDateRange } from '../models/chart-range.model';

export interface NgxChartPoint {
  name: string;
  value: number;
}

export interface NgxChartSeries {
  name: string;
  series: NgxChartPoint[];
}

type BucketUnit = 'day' | 'week' | 'month';

interface RoleDefinition {
  key: string;
  label: string;
}

const ROLE_SERIES: RoleDefinition[] = [
  { key: 'SWIMMER', label: 'Nageurs' },
  { key: 'COACH', label: 'Coachs' },
  { key: 'ADMIN', label: 'Admins' },
  { key: 'VISITOR', label: 'Visiteurs' }
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, diff));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function parseUserCreatedAt(user: Record<string, unknown>): Date | null {
  const raw = user['createdAt'] ?? user['created_at'];
  if (!raw) {
    return null;
  }

  if (Array.isArray(raw)) {
    const [year, month, day, hour = 0, minute = 0] = raw as number[];
    return new Date(year, month - 1, day, hour, minute);
  }

  if (typeof raw === 'string') {
    const normalized = raw.includes(' ') && !raw.includes('T') ? raw.replace(' ', 'T') : raw;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daySpanInclusive(start: Date, end: Date): number {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.floor(ms / 86400000) + 1;
}

function pickBucketUnit(start: Date, end: Date): BucketUnit {
  const days = daySpanInclusive(start, end);
  if (days <= 31) {
    return 'day';
  }
  if (days <= 120) {
    return 'week';
  }
  return 'month';
}

function generateBuckets(start: Date, end: Date, unit: BucketUnit): Date[] {
  const buckets: Date[] = [];
  let cursor =
    unit === 'day' ? startOfDay(start) : unit === 'week' ? startOfWeek(start) : startOfMonth(start);
  const endCursor = startOfDay(end);

  while (cursor.getTime() <= endCursor.getTime()) {
    buckets.push(new Date(cursor));
    if (unit === 'day') {
      cursor = addDays(cursor, 1);
    } else if (unit === 'week') {
      cursor = addDays(cursor, 7);
    } else {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  return buckets.length ? buckets : [startOfDay(start)];
}

function bucketKey(date: Date, unit: BucketUnit): string {
  if (unit === 'day') {
    return startOfDay(date).toISOString().slice(0, 10);
  }
  if (unit === 'week') {
    return startOfWeek(date).toISOString().slice(0, 10);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatBucketLabel(date: Date, unit: BucketUnit): string {
  if (unit === 'day') {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
  if (unit === 'week') {
    const end = addDays(date, 6);
    return `${date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
  }
  return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

function assignBucket(date: Date, unit: BucketUnit): string {
  if (unit === 'day') {
    return bucketKey(date, 'day');
  }
  if (unit === 'week') {
    return bucketKey(date, 'week');
  }
  return bucketKey(startOfMonth(date), 'month');
}

export function buildInscriptionActivityChart(
  users: Record<string, unknown>[],
  range: ChartDateRange
): NgxChartSeries[] {
  const unit = pickBucketUnit(range.start, range.end);
  const buckets = generateBuckets(range.start, range.end, unit);
  const counts = new Map<string, Record<string, number>>();

  for (const bucket of buckets) {
    counts.set(bucketKey(bucket, unit), {
      SWIMMER: 0,
      COACH: 0,
      ADMIN: 0,
      VISITOR: 0
    });
  }

  for (const user of users) {
    const created = parseUserCreatedAt(user);
    if (!created || created < range.start || created > range.end) {
      continue;
    }

    const key = assignBucket(created, unit);
    const bucketCounts = counts.get(key);
    if (!bucketCounts) {
      continue;
    }

    const role = String(user['role'] ?? 'VISITOR');
    if (bucketCounts[role] !== undefined) {
      bucketCounts[role]++;
    } else {
      bucketCounts['VISITOR']++;
    }
  }

  return ROLE_SERIES.map(role => ({
    name: role.label,
    series: buckets.map(bucket => {
      const key = bucketKey(bucket, unit);
      const bucketCounts = counts.get(key);
      return {
        name: formatBucketLabel(bucket, unit),
        value: bucketCounts?.[role.key] ?? 0
      };
    })
  }));
}

export const INSCRIPTION_CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#94a3b8'];

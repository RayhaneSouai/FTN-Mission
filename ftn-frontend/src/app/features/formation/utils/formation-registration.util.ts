import { FormationProgram } from '../models/formation.model';

export type ProgramState = 'OPEN' | 'UPCOMING' | 'CLOSED' | 'ARCHIVED';

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDate(value?: string): Date | null {
  if (!value) return null;
  return startOfDay(new Date(value));
}

/** Both theoretical and practical end dates must be in the past. */
export function isFormationFullyCompleted(program: FormationProgram): boolean {
  const today = startOfDay(new Date());
  const theoreticalEnd = parseDate(program.theoreticalEndDate);
  const practicalEnd = parseDate(program.practicalPeriodEnd);
  if (!theoreticalEnd || !practicalEnd) {
    return false;
  }
  return theoreticalEnd < today && practicalEnd < today;
}

export function resolveProgramState(program: FormationProgram, seasonActive = program.season?.active): ProgramState {
  if (!seasonActive) {
    return 'ARCHIVED';
  }
  const today = startOfDay(new Date());
  const start = parseDate(program.registrationStartDate);
  if (start && start > today) {
    return 'UPCOMING';
  }
  const end = parseDate(program.registrationEndDate);
  if (end && end < today) {
    return 'CLOSED';
  }
  if (isFormationFullyCompleted(program)) {
    return 'ARCHIVED';
  }
  return 'OPEN';
}

export function canRegisterToProgram(program: FormationProgram): boolean {
  if (program.status !== 'PUBLISHED' || !program.season?.active) {
    return false;
  }
  return resolveProgramState(program) === 'OPEN';
}

export function programStateLabel(state: ProgramState): string {
  const labels: Record<ProgramState, string> = {
    OPEN: 'Inscriptions ouvertes',
    UPCOMING: 'À venir',
    CLOSED: 'Inscriptions fermées',
    ARCHIVED: 'Archivée'
  };
  return labels[state];
}

export function registrationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente de validation',
    APPROVED: 'Inscription approuvée',
    REJECTED: 'Demande refusée',
    WAITING_LIST: 'Liste d\'attente'
  };
  return labels[status] ?? status;
}

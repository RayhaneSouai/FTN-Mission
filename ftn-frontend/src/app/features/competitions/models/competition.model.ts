export enum Discipline {
  NATATION = 'NATATION',
  EAU_LIBRE = 'EAU_LIBRE',
  WATER_POLO = 'WATER_POLO',
  PLONGEON = 'PLONGEON',
  NAGE_SYNCHRONISEE = 'NAGE_SYNCHRONISEE',
}

export enum CompetitionStatus {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export interface Competition {
  id: number;
  name: string;
  discipline: Discipline;
  startDate: string;
  endDate: string;
  location: string;
  region: string;
  status: CompetitionStatus;
}

export type CompetitionRequest = Omit<Competition, 'id'>;

/** Human-readable labels for display */
export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  [Discipline.NATATION]: 'Natation',
  [Discipline.EAU_LIBRE]: 'Eau libre',
  [Discipline.WATER_POLO]: 'Water-polo',
  [Discipline.PLONGEON]: 'Plongeon',
  [Discipline.NAGE_SYNCHRONISEE]: 'Nage synchronisée',
};

export const STATUS_LABELS: Record<CompetitionStatus, string> = {
  [CompetitionStatus.PLANIFIEE]: 'Planifiée',
  [CompetitionStatus.EN_COURS]: 'En cours',
  [CompetitionStatus.TERMINEE]: 'Terminée',
  [CompetitionStatus.ANNULEE]: 'Annulée',
};

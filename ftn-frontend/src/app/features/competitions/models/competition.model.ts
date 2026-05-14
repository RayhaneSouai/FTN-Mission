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

export enum Secteur {
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL',
}

export enum Region {
  GRAND_TUNIS = 'GRAND_TUNIS',
  SAHEL = 'SAHEL',
  SUD = 'SUD',
}

export enum Piscine {
  RADES_OLYMPIQUE = 'RADES_OLYMPIQUE',
  MENZAH_OLYMPIQUE = 'MENZAH_OLYMPIQUE',
  BELVEDERE = 'BELVEDERE',
  EZZAHRA_OLYMPIQUE = 'EZZAHRA_OLYMPIQUE',
  LA_MARSA_MUNICIPALE = 'LA_MARSA_MUNICIPALE',
  BEN_AROUS = 'BEN_AROUS',

  SOUSSE_OLYMPIQUE = 'SOUSSE_OLYMPIQUE',
  MONASTIR_OLYMPIQUE = 'MONASTIR_OLYMPIQUE',
  HAMMAMET = 'HAMMAMET',

  SFAX_MUNICIPALE = 'SFAX_MUNICIPALE',
}

export interface Competition {
  id: number;
  name: string;
  description?: string;
  discipline: Discipline;
  startDate: string;
  endDate: string;
  secteur: Secteur;
  // National fields
  region?: string;
  lieu?: string;
  // International fields
  country?: string;
  city?: string;
  venue?: string;
  location?: string;
  status?: CompetitionStatus;
}

export type CompetitionRequest = Omit<Competition, 'id' | 'status'>;

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

export const REGION_LABELS: Record<Region, string> = {
  [Region.GRAND_TUNIS]: 'Grand Tunis',
  [Region.SAHEL]: 'Sahel',
  [Region.SUD]: 'Sud',
};

export const PISCINE_LABELS: Record<Piscine, string> = {
  [Piscine.RADES_OLYMPIQUE]: 'Radès Olympique',
  [Piscine.MENZAH_OLYMPIQUE]: 'Menzah Olympique',
  [Piscine.BELVEDERE]: 'Belvédère',

  [Piscine.EZZAHRA_OLYMPIQUE]: 'Ezzahra Olympique',
  [Piscine.LA_MARSA_MUNICIPALE]: 'La Marsa Municipale',
  [Piscine.BEN_AROUS]: 'Ben Arous',

  [Piscine.SOUSSE_OLYMPIQUE]: 'Sousse Olympique',
  [Piscine.MONASTIR_OLYMPIQUE]: 'Monastir Olympique',
  [Piscine.HAMMAMET]: 'Hammamet',

  [Piscine.SFAX_MUNICIPALE]: 'Sfax Municipale',
};

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

export enum Categorie {
  TC = 'TC',
  POUSSINS = 'POUSSINS',
  BENJAMINS = 'BENJAMINS',
  MIN_CAD_JS = 'MIN_CAD_JS',
  MASTERS = 'MASTERS',
  QUATORZE_ANS_ET_PLUS = 'QUATORZE_ANS_ET_PLUS',
  NEUF_ANS = 'NEUF_ANS',
  TREIZE_DIX_HUIT_ANS = 'TREIZE_DIX_HUIT_ANS',
}

export interface Competition {
  id: number;
  name: string;
  description?: string;
  discipline: Discipline;
  startDate: string;
  endDate: string;
  categorie?: Categorie;
  region?: string;
  lieu?: string;
  status?: CompetitionStatus;
  programmeStatus?: 'DRAFT' | 'APPROVED' | null;
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

export const CATEGORIE_LABELS: Record<Categorie, string> = {
  [Categorie.TC]: 'TC (Toutes Catégories)',
  [Categorie.POUSSINS]: 'Poussins',
  [Categorie.BENJAMINS]: 'Benjamins',
  [Categorie.MIN_CAD_JS]: 'Min-Cad-J/S',
  [Categorie.MASTERS]: 'Masters',
  [Categorie.QUATORZE_ANS_ET_PLUS]: '14 ans et +',
  [Categorie.NEUF_ANS]: '9 ans',
  [Categorie.TREIZE_DIX_HUIT_ANS]: '13-18 ans',
};

/* ─── Programme Models (Legacy v1) ─── */

export interface ProgrammeDay {
  id: number;
  dayNumber: number;
  date: string;
  session?: string;
  events: ProgrammeEvent[];
}

export interface ProgrammeEvent {
  id: number;
  eventNumber: number;
  eventName: string;
  gender?: string;
  distance?: string;
  stroke?: string;
  series: EventSeries[];
}

export interface EventSeries {
  id: number;
  seriesNumber: number;
  startTime?: string;
  participants: SeriesParticipant[];
}

export interface SeriesParticipant {
  id: number;
  lane: number;
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  birthDate?: string;
  gender?: string;
  club?: string;
  entryTime: string;
}

/* ─── Programme Models (v2 - flat ProgramItem) ─── */

export type ProgramItemType = 'PART' | 'SERIES';

export type ProgrammeStatus = 'DRAFT' | 'APPROVED';

export interface ProgrammeStatusResponse {
  competitionId: number;
  totalDaysRequired: number;
  daysCreated: number;
  programGenerated: boolean;
  programmeStatus: ProgrammeStatus | null;
  days: ProgrammeDayResponse[];
}

export interface ProgrammeDayResponse {
  id: number;
  dayNumber: number;
  date: string;
  items: ProgramItemResponse[];
}

export interface ProgramItemResponse {
  id: number;
  label: string;
  time: string;
  type: ProgramItemType;
  numberOfParticipants?: number;
}

// Request DTOs
export interface ProgramItemRequest {
  label: string;
  time: string;
  type: ProgramItemType;
  numberOfParticipants?: number;
}

/** Preset labels for program items */
export const PROGRAM_ITEM_PRESETS: { label: string; type: ProgramItemType }[] = [
  { label: 'Ouverture des portes', type: 'PART' },
  { label: 'Échauffements', type: 'PART' },
  { label: 'Évacuation du bassin', type: 'PART' },
  { label: 'Début des épreuves', type: 'PART' },
  { label: 'Pause', type: 'PART' },
  { label: 'Remise des médailles', type: 'PART' },
];

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
  AVENIRS = 'AVENIRS',
  POUSSINS = 'POUSSINS',
  BENJAMINS = 'BENJAMINS',
  MINIMES = 'MINIMES',
  CADETS = 'CADETS',
  JUNIORS_SENIORS = 'JUNIORS_SENIORS',
  JUNIORS = 'JUNIORS',
  SENIORS = 'SENIORS',
}

export interface Competition {
  id: number;
  name: string;
  description?: string;
  discipline: Discipline;
  startDate: string;
  endDate: string;
  allowedCategories?: Categorie[];
  region?: string;
  lieu?: string;
  status?: CompetitionStatus;
  programmeStatus?: 'DRAFT' | 'APPROVED' | null;
  /* ─── Participation Conditions ─── */
  participationDeadline?: string | null;
  allowedGender?: 'HOMME' | 'FEMME' | null;
  minAge?: number | null;
  maxAge?: number | null;
  maxEvents?: number | null;
  customConditions?: string | null;
  /* ─── New Competition Conditions ─── */
  licenseRequired?: boolean;
  medicalCertificateRequired?: boolean;
  hasMinimas?: boolean;
  minimaTime?: number | null;
}

/** Backend response for GET /api/competitions/get/:id */
export interface CompetitionDetailResponse {
  competition: Competition;
  participationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE';
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
  [Categorie.AVENIRS]: 'Avenirs (≤9 ans)',
  [Categorie.POUSSINS]: 'Poussins (10-11 ans)',
  [Categorie.BENJAMINS]: 'Benjamins (12-13 ans)',
  [Categorie.MINIMES]: 'Minimes (14-15 ans)',
  [Categorie.CADETS]: 'Cadets (16-17 ans)',
  [Categorie.JUNIORS_SENIORS]: 'Juniors/Seniors (18+ ans)',
  [Categorie.JUNIORS]: 'Juniors/Seniors (18+ ans)',
  [Categorie.SENIORS]: 'Juniors/Seniors (18+ ans)',
};

/* ─── Age Category Utility ─── */

export function determineAgeCategory(birthDate: string, referenceDate: string): Categorie {
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;

  if (age <= 9) return Categorie.AVENIRS;
  if (age <= 11) return Categorie.POUSSINS;
  if (age <= 13) return Categorie.BENJAMINS;
  if (age <= 15) return Categorie.MINIMES;
  if (age <= 17) return Categorie.CADETS;
  return Categorie.JUNIORS_SENIORS;
}

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
  swimmerCategory?: string;
  seriesGender?: string;
}

// Request DTOs
export interface ProgramItemRequest {
  label: string;
  time: string;
  type: ProgramItemType;
  numberOfParticipants?: number;
  swimmerCategory?: string;
  seriesGender?: string;
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

/* ─── FTN Age Categories ─── */

export enum AgeCategory {
  AVENIRS_POUSSINS = 'AVENIRS_POUSSINS',
  BENJAMINS = 'BENJAMINS',
  MINIMES = 'MINIMES',
  CADETS = 'CADETS',
  JUNIORS_SENIORS = 'JUNIORS_SENIORS',
  TC = 'TC',
}

export const AGE_CATEGORY_LABELS: Record<AgeCategory, string> = {
  [AgeCategory.AVENIRS_POUSSINS]: 'Avenirs/Poussins (9–11)',
  [AgeCategory.BENJAMINS]: 'Benjamins (12–13)',
  [AgeCategory.MINIMES]: 'Minimes (14–15)',
  [AgeCategory.CADETS]: 'Cadets (16–17)',
  [AgeCategory.JUNIORS_SENIORS]: 'Juniors/Seniors (18+)',
  [AgeCategory.TC]: 'Toutes Catégories',
};

/* ─── Participation Request ─── */

export enum ParticipationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, string> = {
  [ParticipationStatus.PENDING]: 'En attente',
  [ParticipationStatus.APPROVED]: 'Approuvé',
  [ParticipationStatus.REJECTED]: 'Rejeté',
};

export interface ParticipationResponseDTO {
  id: number;
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  competitionId: number;
  competitionName: string;
  status: string;
  requestedAt: string | null;
  rejectionReason: string | null;
}

/* ─── Distribution Models ─── */

export enum DistributionStatus {
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
}

export interface DistributionParticipant {
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  position: number;
  bestTime: number | null;
}

export interface DistributionSeries {
  seriesId: number;
  seriesLabel: string;
  swimmerCategory: string | null;
  time: string | null;
  capacity: number;
  participants: DistributionParticipant[];
}

export interface DistributionResponse {
  competitionId: number;
  competitionName: string;
  status: DistributionStatus;
  generatedAt: string;
  approvedAt: string | null;
  series: DistributionSeries[];
}

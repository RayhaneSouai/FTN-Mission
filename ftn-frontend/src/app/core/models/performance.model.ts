export interface PerformanceResponse {
  id: number;
  time: number;
  distance: number;
  stroke: string;
  date: string;
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  personalRecord: boolean;
  nationalRecord: boolean;
}

export interface PerformanceRequest {
  time: number;
  distance: number;
  stroke: string;
  date: string;
  swimmerId: number;
}

export interface RankingEntry {
  rank: number;
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  clubName?: string;
  category: string;
  time: number;
  date: string;
  distance: number;
  stroke: string;
  isNationalRecord: boolean;
}

export interface CompetitionResult {
export interface RecordDTO {
  distance: number;
  stroke: string;
  gender: string;
  recordTime: number;
  dateAchieved: string;
  holderId: number;
  holderFirstName: string;
  holderLastName: string;
  holderClub?: string;
}

export interface CompetitionResultDTO {
  position: number;
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  officialTime: number;
  disqualified: boolean;
  recordedAt: string;
}

export const STROKE_LABELS: Record<string, string> = {
  LIBRE: 'Libre',
  DOS: 'Dos',
  BRASSE: 'Brasse',
  PAPILLON: 'Papillon',
  QUATRE_NAGES: 'Quatre nages',
};

export const GENDER_LABELS: Record<string, string> = {
  HOMME: 'Homme',
  FEMME: 'Femme',
};

export const NIVEAU_LABELS: Record<string, string> = {
  POUSSIN: 'Poussin',
  BENJAMIN: 'Benjamin',
  MINIME: 'Minime',
  CADET: 'Cadet',
  JUNIOR: 'Junior',
  SENIOR: 'Senior',
  MASTER: 'Master',
};

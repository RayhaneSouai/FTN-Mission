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

export interface RankingEntry {
  rank: number;
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  category: string;
  time: number;
  date: string;
  distance: number;
  stroke: string;
  isNationalRecord: boolean;
}

export interface CompetitionResult {
  position: number;
  swimmerId: number;
  swimmerFirstName: string;
  swimmerLastName: string;
  officialTime: number;
  disqualified: boolean;
  recordedAt: string;
}

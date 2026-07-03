export interface Club {
  id?: number;
  name: string;
  region?: string;
  address?: string;
  contact?: string;
  manager?: string;
  affiliationDate?: string;
  swimmers?: unknown[];
}

export interface ClubMember {
  id: number;
  fullName: string;
  email: string;
  age?: number;
  category?: string;
  discipline?: string;
}

export interface ClubStats {
  athleteCount: number;
  coachCount: number;
  totalPerformances: number;
  personalRecordsCount: number;
}

export interface ClubDetail {
  id: number;
  name: string;
  region?: string;
  address?: string;
  contact?: string;
  manager?: string;
  affiliationDate?: string;
  discipline?: string;
  maxCapacity: number;
  active: boolean;
  athletes: ClubMember[];
  coaches: ClubMember[];
  stats: ClubStats;
}

export interface ClubJoinRequest {
  id: number;
  swimmerId: number;
  swimmerName: string;
  swimmerEmail: string;
  clubId: number;
  clubName: string;
  clubRegion: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  message?: string;
  motivationLetter?: string;
  currentLevel?: string;
  previousClub?: string;
  availability?: string;
  rejectionReason?: string;
  eligibilityScore?: number;
  criteriaMet?: number;
  criteriaTotal?: number;
}

export interface ClubRequirementItem {
  key: string;
  label: string;
  expected: string;
  actual: string;
  met: boolean;
  manualReview: boolean;
}

export interface ClubJoinPreview {
  requirements: ClubRequirementItem[];
  criteriaMet: number;
  criteriaTotal: number;
  eligibilityScore: number;
  predictedStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  predictedLabel: string;
  summary: string;
}

export type ClubLevel = 'BENJAMIN' | 'MINIME' | 'CADET' | 'JUNIOR' | 'SENIOR';

export interface ClubJoinFormPayload {
  motivationLetter: string;
  currentLevel: ClubLevel;
  previousClub?: string;
  availability?: string;
}

export interface ClubRanking {
  id: number;
  name: string;
  region?: string;
  swimmerCount: number;
}

export interface ClubCompetitionSummary {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  discipline?: string;
  engagementCount: number;
}

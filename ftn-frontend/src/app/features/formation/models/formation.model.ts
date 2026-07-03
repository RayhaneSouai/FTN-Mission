export type BrevetType = 'BF1' | 'BF2';
export type FormationProgramStatus = 'DRAFT' | 'PUBLISHED';
export type ProgramType = 'COACH_CERTIFICATION' | 'SWIMMER_TRAINING';
export type TargetCategory = 'AVENIRS' | 'BENJAMINS' | 'MINIMES' | 'CADETS' | 'JUNIORS' | 'SENIORS';
export type TrainingSessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Coach {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface TrainingSession {
  id?: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  status?: TrainingSessionStatus;
}

export interface Season {
  id?: number;
  label: string;
  active: boolean;
  createdAt?: string;
}

export interface FormationScheduleItem {
  id?: number;
  sortOrder: number;
  dayLabel: string;
  timeSlot: string;
  content: string;
}

export interface FormationDocument {
  id?: number;
  title: string;
  url: string;
  type?: string;
  sortOrder?: number;
}

export interface FormationProgram {
  id?: number;
  title: string;
  programType?: ProgramType;
  brevetType?: BrevetType;
  targetCategory?: TargetCategory;
  maxParticipants?: number;
  coach?: Coach;
  location?: string;
  pricePerSession?: number;
  registeredCount?: number;
  season: Pick<Season, 'id'> & Partial<Season>;
  status: FormationProgramStatus;
  registrationStartDate?: string;
  registrationEndDate?: string;
  registrationLocation?: string;
  registrationConditions?: string;
  registrationFee?: number;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteFax?: string;
  theoreticalStartDate?: string;
  theoreticalEndDate?: string;
  theoreticalLocation?: string;
  theoreticalHours?: string;
  theoreticalExamDate?: string;
  theoreticalExamTime?: string;
  practicalDescription?: string;
  practicalPeriodStart?: string;
  practicalPeriodEnd?: string;
  resultAnnouncementNote?: string;
  scheduleItems: FormationScheduleItem[];
  documents?: FormationDocument[];
}

export type FormationRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_LIST';
export type FormationPhase = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface FormationRegistration {
  id: number;
  status: FormationRegistrationStatus;
  registeredAt: string;
  eligibilityNote?: string;
  decisionNote?: string;
  phase: FormationPhase;
  program: FormationProgram;
  swimmerId?: number;
  swimmerName?: string;
  swimmerEmail?: string;
}

export interface FormationCertificate {
  id: number;
  verificationCode: string;
  issuedAt?: string;
  pdfUrl?: string;
  downloadable: boolean;
  verified: boolean;
  program: FormationProgram;
  registrationId?: number;
}

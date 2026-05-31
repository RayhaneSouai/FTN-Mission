export type BrevetType = 'BF1' | 'BF2';
export type FormationProgramStatus = 'DRAFT' | 'PUBLISHED';

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

export interface FormationProgram {
  id?: number;
  title: string;
  brevetType: BrevetType;
  season: { id: number };
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
}

export const USER_IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const USER_IMPORT_MAX_ROWS = 500;
export const USER_IMPORT_PREVIEW_ROWS = 8;
export const USER_IMPORT_ACCEPT = '.csv,text/csv';

export const VALID_ROLES = ['SWIMMER', 'COACH', 'VISITOR'] as const;
export type ImportableRole = (typeof VALID_ROLES)[number];

export const VALID_GENDERS = ['HOMME', 'FEMME'] as const;

export const VALID_DISCIPLINES = [
  'NATATION',
  'EAU_LIBRE',
  'WATER_POLO',
  'PLONGEON',
  'NAGE_SYNCHRONISEE'
] as const;

export const VALID_NIVEAUX = [
  'POUSSIN',
  'BENJAMIN',
  'MINIME',
  'CADET',
  'JUNIOR',
  'SENIOR',
  'MASTER'
] as const;

export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

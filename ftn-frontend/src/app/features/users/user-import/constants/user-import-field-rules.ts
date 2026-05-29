import { ImportableRole } from './user-import.constants';
import { UserImportField } from '../models/user-import.types';

/** Colonnes interdites dans le CSV — le statut est géré uniquement dans l'UI admin après import. */
export const FORBIDDEN_CSV_COLUMN_ALIASES = [
  'statut',
  'status',
  'registration_status',
  'registrationstatus',
  'etat',
  'state',
  'active',
  'actif',
  'confirme',
  'en_attente'
];

export const IDENTITY_FIELDS: UserImportField[] = ['fullName', 'firstName', 'lastName'];

export const MAPPING_REQUIRED_FIELDS: UserImportField[] = ['email', 'role'];

export interface FieldRuleDescriptor {
  field: UserImportField;
  label: string;
  csv: 'required' | 'conditional' | 'forbidden' | 'optional';
  description: string;
}

/** Règles affichées dans l'assistant — source unique alignée avec le validateur. */
export const USER_IMPORT_FIELD_RULES: FieldRuleDescriptor[] = [
  {
    field: 'fullName',
    label: 'Nom complet',
    csv: 'conditional',
    description: 'Recommandé : une colonne « nom complet » OU les colonnes prénom + nom séparées.'
  },
  {
    field: 'email',
    label: 'Email',
    csv: 'required',
    description: 'Obligatoire. Format email valide, unique dans le fichier et en base.'
  },
  {
    field: 'role',
    label: 'Rôle',
    csv: 'required',
    description: 'Obligatoire : Nageur (SWIMMER), Coach (COACH) ou Visiteur (VISITOR). Admin interdit à l\'import.'
  },
  {
    field: 'gender',
    label: 'Genre',
    csv: 'conditional',
    description: 'Obligatoire pour Nageur et Coach. Optionnel pour Visiteur.'
  },
  {
    field: 'birthDate',
    label: 'Date de naissance',
    csv: 'conditional',
    description: 'Obligatoire pour Nageur et Coach (AAAA-MM-JJ ou JJ/MM/AAAA). Optionnel pour Visiteur.'
  },
  {
    field: 'discipline',
    label: 'Discipline',
    csv: 'conditional',
    description: 'Obligatoire pour Nageur uniquement. Ignoré pour Coach et Visiteur.'
  },
  {
    field: 'niveau',
    label: 'Niveau / catégorie',
    csv: 'conditional',
    description: 'Obligatoire pour Nageur uniquement (Poussin, Benjamin, Minime, etc.).'
  },
  {
    field: 'anciennete',
    label: 'Ancienneté (années)',
    csv: 'conditional',
    description: 'Obligatoire pour Coach (nombre ≥ 0). Ignoré pour les autres rôles.'
  }
];

export const IMPORT_STATUS_POLICY =
  'Le statut d\'inscription n\'est pas importé depuis le CSV. Tous les comptes créés sont placés en « en attente de validation » et validés par l\'administrateur dans la liste des utilisateurs.';

export function isFieldRequiredForRole(field: UserImportField, role: ImportableRole): boolean {
  switch (field) {
    case 'gender':
    case 'birthDate':
      return role === 'SWIMMER' || role === 'COACH';
    case 'discipline':
    case 'niveau':
      return role === 'SWIMMER';
    case 'anciennete':
      return role === 'COACH';
    default:
      return false;
  }
}

export function isFieldAllowedForRole(field: UserImportField, role: ImportableRole): boolean {
  if (field === 'discipline' || field === 'niveau') return role === 'SWIMMER';
  if (field === 'anciennete') return role === 'COACH';
  return true;
}

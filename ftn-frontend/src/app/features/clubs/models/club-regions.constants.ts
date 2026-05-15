import { RegionOption } from './region.model';

/** Fallback si l'API /regions est indisponible (aligné sur l'enum backend Region) */
export const CLUB_REGION_OPTIONS: RegionOption[] = [
  { value: 'GRAND_TUNIS', label: 'Grand Tunis' },
  { value: 'SAHEL', label: 'Sahel' },
  { value: 'SUD', label: 'Sud' },
  { value: 'ARIANA', label: 'Ariana' },
  { value: 'BEJA', label: 'Béja' },
  { value: 'BEN_AROUS', label: 'Ben Arous' },
  { value: 'BIZERTE', label: 'Bizerte' },
  { value: 'GABES', label: 'Gabès' },
  { value: 'GAFSA', label: 'Gafsa' },
  { value: 'JENDOUBA', label: 'Jendouba' },
  { value: 'KAIROUAN', label: 'Kairouan' },
  { value: 'KASSERINE', label: 'Kasserine' },
  { value: 'KEBILI', label: 'Kébili' },
  { value: 'LE_KEF', label: 'Le Kef' },
  { value: 'MAHDIA', label: 'Mahdia' },
  { value: 'MANOUBA', label: 'Manouba' },
  { value: 'MEDENINE', label: 'Médenine' },
  { value: 'MONASTIR', label: 'Monastir' },
  { value: 'NABEUL', label: 'Nabeul' },
  { value: 'SFAX', label: 'Sfax' },
  { value: 'SIDI_BOUZID', label: 'Sidi Bouzid' },
  { value: 'SILIANA', label: 'Siliana' },
  { value: 'SOUSSE', label: 'Sousse' },
  { value: 'TATAOUINE', label: 'Tataouine' },
  { value: 'TOZEUR', label: 'Tozeur' },
  { value: 'TUNIS', label: 'Tunis' },
  { value: 'ZAGHOUAN', label: 'Zaghouan' }
];

import { RegionOption } from './region.model';

/** Zones FTN (macro-régions) — données locales, aucun appel API */
export const FTN_ZONES: RegionOption[] = [
  { value: 'GRAND_TUNIS', label: 'Grand Tunis' },
  { value: 'SAHEL', label: 'Sahel' },
  { value: 'SUD', label: 'Sud' }
];

/** Gouvernorats par zone (liste statique, performante) */
export const GOVERNORATES_BY_ZONE: Record<string, RegionOption[]> = {
  GRAND_TUNIS: [
    { value: 'TUNIS', label: 'Tunis' },
    { value: 'ARIANA', label: 'Ariana' },
    { value: 'BEN_AROUS', label: 'Ben Arous' },
    { value: 'MANOUBA', label: 'Manouba' },
    { value: 'BIZERTE', label: 'Bizerte' },
    { value: 'NABEUL', label: 'Nabeul' },
    { value: 'ZAGHOUAN', label: 'Zaghouan' }
  ],
  SAHEL: [
    { value: 'SOUSSE', label: 'Sousse' },
    { value: 'MONASTIR', label: 'Monastir' },
    { value: 'MAHDIA', label: 'Mahdia' },
    { value: 'KAIROUAN', label: 'Kairouan' },
    { value: 'SFAX', label: 'Sfax' }
  ],
  SUD: [
    { value: 'SFAX', label: 'Sfax' },
    { value: 'GABES', label: 'Gabès' },
    { value: 'MEDENINE', label: 'Médenine' },
    { value: 'TATAOUINE', label: 'Tataouine' },
    { value: 'TOZEUR', label: 'Tozeur' },
    { value: 'KEBILI', label: 'Kébili' },
    { value: 'GAFSA', label: 'Gafsa' },
    { value: 'SIDI_BOUZID', label: 'Sidi Bouzid' }
  ]
};

export const ALL_GOVERNORATES: RegionOption[] = Object.values(GOVERNORATES_BY_ZONE)
  .flat()
  .filter((g, i, arr) => arr.findIndex((x) => x.value === g.value) === i)
  .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

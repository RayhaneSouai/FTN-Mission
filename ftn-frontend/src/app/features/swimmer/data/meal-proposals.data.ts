export type MealContext =
  | 'PRE_TRAINING'
  | 'POST_TRAINING'
  | 'COMPETITION'
  | 'REST_DAY'
  | 'PRE_COMPETITION'
  | 'QUICK_SNACK';

export interface MealProposal {
  id: string;
  name: string;
  description: string;
  context: MealContext;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  plateRatio: { carbs: number; protein: number; veggies: number }; // % must sum to 100
  timing: string;
  preparationTime: string;
  tags: string[];
}

export const MEAL_CONTEXTS: Record<MealContext, { label: string; icon: string; description: string; color: string; bgColor: string }> = {
  PRE_TRAINING: {
    label: 'Avant séance',
    icon: '🌅',
    description: 'Énergie disponible, digestion rapide — éviter graisses et fibres',
    color: '#f59e0b',
    bgColor: '#fefce8'
  },
  POST_TRAINING: {
    label: 'Récupération post-séance',
    icon: '💪',
    description: 'Fenêtre 30-60 min : glucides + protéines pour reconstituer les fibres',
    color: '#10b981',
    bgColor: '#f0fdf4'
  },
  COMPETITION: {
    label: 'Jour de compétition',
    icon: '🏆',
    description: 'Énergie stable, sans risque digestif, rien de nouveau',
    color: '#6366f1',
    bgColor: '#f5f3ff'
  },
  REST_DAY: {
    label: 'Jour de repos',
    icon: '🛌',
    description: 'Apport réduit en glucides, plus de légumes et protéines',
    color: '#64748b',
    bgColor: '#f8fafc'
  },
  PRE_COMPETITION: {
    label: 'Veille de compétition',
    icon: '🌙',
    description: 'Chargement glycogène, aliments connus, rien de risqué',
    color: '#3b82f6',
    bgColor: '#eff6ff'
  },
  QUICK_SNACK: {
    label: 'Collation rapide',
    icon: '⚡',
    description: 'En 5 min, transportable, entre deux séries en compétition',
    color: '#ef4444',
    bgColor: '#fef2f2'
  }
};

export const MEAL_PROPOSALS: MealProposal[] = [
  // === AVANT SÉANCE (PRE_TRAINING) ===
  {
    id: 'pre_1', name: 'Porridge banane-miel', context: 'PRE_TRAINING',
    description: 'Energie progressive, glucides complexes + simple, digestion facile',
    calories: 380, protein: 10, carbs: 72, fat: 5,
    ingredients: ['60g flocons d\'avoine', '250ml lait', '1 banane', '1 c. à soupe miel'],
    plateRatio: { carbs: 65, protein: 20, veggies: 15 },
    timing: '1h30 à 2h avant la séance', preparationTime: '5 min',
    tags: ['porridge', 'avoine', 'banane', 'facile']
  },
  {
    id: 'pre_2', name: 'Pain complet + oeuf + jus d\'orange', context: 'PRE_TRAINING',
    description: 'Classique équilibré, énergie rapide et soutenue',
    calories: 320, protein: 14, carbs: 52, fat: 7,
    ingredients: ['2 tranches pain complet', '1 oeuf à la coque', '1 verre jus d\'orange frais'],
    plateRatio: { carbs: 60, protein: 25, veggies: 15 },
    timing: '1h à 1h30 avant la séance', preparationTime: '10 min',
    tags: ['pain', 'oeuf', 'jus', 'matin']
  },
  {
    id: 'pre_3', name: 'Dattes + Bsissa + eau', context: 'PRE_TRAINING',
    description: 'Collation traditionnelle tunisienne haute-énergie, éprouvée et digeste',
    calories: 268, protein: 9, carbs: 53, fat: 4,
    ingredients: ['4 dattes Deglet Nour', '50g bsissa', '500ml eau'],
    plateRatio: { carbs: 75, protein: 15, veggies: 10 },
    timing: '30 min à 1h avant', preparationTime: '2 min',
    tags: ['dattes', 'bsissa', 'tunisien', 'rapide']
  },

  // === RÉCUPÉRATION POST-SÉANCE (POST_TRAINING) ===
  {
    id: 'post_1', name: 'Smoothie récupération banane-lait', context: 'POST_TRAINING',
    description: 'Ratio glucides/protéines idéal (4:1), liquide pour réhydratation rapide',
    calories: 380, protein: 16, carbs: 60, fat: 7,
    ingredients: ['300ml lait entier', '2 bananes', '30g yaourt grec', '1 c. à soupe miel'],
    plateRatio: { carbs: 60, protein: 30, veggies: 10 },
    timing: 'Dans les 30 min après la séance', preparationTime: '3 min',
    tags: ['smoothie', 'récupération', 'lait', 'banane']
  },
  {
    id: 'post_2', name: 'Riz + poulet + tomates', context: 'POST_TRAINING',
    description: 'Repas complet de récupération, reconstitue glycogène + réparation musculaire',
    calories: 520, protein: 46, carbs: 58, fat: 9,
    ingredients: ['180g riz blanc cuit', '150g blanc de poulet', '2 tomates', 'filet d\'huile d\'olive'],
    plateRatio: { carbs: 45, protein: 40, veggies: 15 },
    timing: '30-60 min après la séance', preparationTime: '20 min',
    tags: ['riz', 'poulet', 'complet', 'récupération']
  },
  {
    id: 'post_3', name: 'Yaourt grec + miel + fruits rouges', context: 'POST_TRAINING',
    description: 'Option légère et rapide pour les séances du matin avant d\'aller à l\'école',
    calories: 285, protein: 14, carbs: 42, fat: 6,
    ingredients: ['150g yaourt grec', '1 c. à soupe miel', '150g fraises', '30g granola'],
    plateRatio: { carbs: 55, protein: 30, veggies: 15 },
    timing: 'Dans les 30 min après', preparationTime: '3 min',
    tags: ['yaourt', 'grec', 'rapide', 'protéines']
  },

  // === COMPÉTITION (COMPETITION) ===
  {
    id: 'comp_1', name: 'Petit-déjeuner de compétition (éprouvé)', context: 'COMPETITION',
    description: 'Aliments déjà testés, rien de nouveau, digestion garantie',
    calories: 490, protein: 18, carbs: 85, fat: 8,
    ingredients: ['180g flocons d\'avoine au lait', '1 banane', '2 tartines de pain + miel', '1 verre d\'eau'],
    plateRatio: { carbs: 70, protein: 20, veggies: 10 },
    timing: '2h30 à 3h avant la première série', preparationTime: '10 min',
    tags: ['compétition', 'matin', 'avoine', 'sûr']
  },
  {
    id: 'comp_2', name: 'Entre séries : Dattes + boisson isotonique', context: 'COMPETITION',
    description: 'Recharge ultra-rapide entre deux séries, à consommer en 5 min maximum',
    calories: 220, protein: 1, carbs: 57, fat: 0.1,
    ingredients: ['4 dattes', '500ml boisson isotonique'],
    plateRatio: { carbs: 90, protein: 5, veggies: 5 },
    timing: 'Immédiatement après chaque série', preparationTime: '0 min',
    tags: ['compétition', 'entre séries', 'rapide', 'énergie']
  },
  {
    id: 'comp_3', name: 'Collation mi-journée compétition', context: 'COMPETITION',
    description: 'Repas léger pour maintenir l\'énergie entre des séries espacées',
    calories: 350, protein: 15, carbs: 52, fat: 7,
    ingredients: ['2 sandwichs pain/blanc de poulet', '1 yaourt', '1 banane'],
    plateRatio: { carbs: 55, protein: 30, veggies: 15 },
    timing: '1h30 à 2h avant la prochaine série', preparationTime: '5 min',
    tags: ['compétition', 'sandwich', 'léger']
  },

  // === JOUR DE REPOS (REST_DAY) ===
  {
    id: 'rest_1', name: 'Salade de thon complète', context: 'REST_DAY',
    description: 'Apport en légumes élevé, protéines maigres, glucides réduits — récupération profonde',
    calories: 380, protein: 32, carbs: 28, fat: 14,
    ingredients: ['100g thon en boîte', 'Salade verte', '2 tomates', '1 oeuf dur', '30g olives', 'vinaigrette légère'],
    plateRatio: { carbs: 25, protein: 45, veggies: 30 },
    timing: 'Déjeuner', preparationTime: '10 min',
    tags: ['salade', 'thon', 'légumes', 'léger', 'repos']
  },
  {
    id: 'rest_2', name: 'Poulet vapeur + brocolis + couscous', context: 'REST_DAY',
    description: 'Repas équilibré, peu de graisses, riche en micronutriments',
    calories: 450, protein: 40, carbs: 45, fat: 8,
    ingredients: ['150g poulet vapeur', '150g brocolis', '100g couscous cuit', 'herbes fraîches'],
    plateRatio: { carbs: 35, protein: 40, veggies: 25 },
    timing: 'Déjeuner ou dîner', preparationTime: '25 min',
    tags: ['poulet', 'brocoli', 'couscous', 'repos', 'sain']
  },

  // === VEILLE DE COMPÉTITION (PRE_COMPETITION) ===
  {
    id: 'precomp_1', name: 'Pasta Party (pâtes au poulet)', context: 'PRE_COMPETITION',
    description: 'Chargement en glycogène classique, aliments connus et appréciés',
    calories: 680, protein: 42, carbs: 95, fat: 12,
    ingredients: ['250g pâtes cuites', '150g blanc de poulet', 'sauce tomate maison', 'parmesan'],
    plateRatio: { carbs: 60, protein: 30, veggies: 10 },
    timing: 'Dîner (la veille)', preparationTime: '20 min',
    tags: ['pasta', 'pâtes', 'veille', 'glycogène', 'compétition']
  },
  {
    id: 'precomp_2', name: 'Riz au poulet traditionnel', context: 'PRE_COMPETITION',
    description: 'Version tunisienne du "pasta party", aliment familier sans risque digestif',
    calories: 620, protein: 40, carbs: 82, fat: 10,
    ingredients: ['200g riz blanc cuit', '150g poulet mijoté', 'légumes doux', 'huile d\'olive'],
    plateRatio: { carbs: 58, protein: 32, veggies: 10 },
    timing: 'Dîner (la veille)', preparationTime: '30 min',
    tags: ['riz', 'poulet', 'veille', 'traditionnel', 'tunisien']
  },

  // === COLLATION RAPIDE (QUICK_SNACK) ===
  {
    id: 'snack_1', name: 'Banane + amandes', context: 'QUICK_SNACK',
    description: 'Portable, 0 préparation, glucides rapides + graisses saines',
    calories: 282, protein: 6, carbs: 32, fat: 15,
    ingredients: ['1 banane', '30g amandes'],
    plateRatio: { carbs: 55, protein: 15, veggies: 30 },
    timing: 'Avant ou entre les séances', preparationTime: '0 min',
    tags: ['banane', 'amandes', 'portable', 'rapide']
  },
  {
    id: 'snack_2', name: '3 Dattes + yaourt', context: 'QUICK_SNACK',
    description: 'Énergie instantanée + protéines, parfait pour attente en compétition',
    calories: 210, protein: 6, carbs: 40, fat: 2,
    ingredients: ['3 dattes Deglet Nour', '1 pot yaourt nature'],
    plateRatio: { carbs: 70, protein: 20, veggies: 10 },
    timing: 'N\'importe quand', preparationTime: '0 min',
    tags: ['dattes', 'yaourt', 'tunisien', 'rapide', 'compétition']
  },
  {
    id: 'snack_3', name: 'Pain + beurre de cacahuète', context: 'QUICK_SNACK',
    description: 'Énergie longue durée, pratique à transporter dans un sac de sport',
    calories: 310, protein: 12, carbs: 35, fat: 16,
    ingredients: ['2 tranches pain complet', '2 c. à soupe beurre de cacahuète'],
    plateRatio: { carbs: 50, protein: 20, veggies: 30 },
    timing: '1h avant la séance ou pendant la compétition', preparationTime: '2 min',
    tags: ['pain', 'cacahuète', 'sandwich', 'pratique']
  }
];

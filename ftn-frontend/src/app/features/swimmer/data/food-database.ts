// Base locale d'aliments courants pour nageurs (valeurs pour 100g ou portion standard indiquée)
export interface FoodItem {
  name: string;
  nameFr: string;
  portion: string;        // ex: "100g", "1 oeuf (60g)", "1 tranche (30g)"
  portionGrams: number;   // en grammes
  calories: number;
  protein: number;        // g
  carbs: number;          // g
  fat: number;            // g
  category: 'PROTEIN' | 'CARBS' | 'VEGGIE' | 'DAIRY' | 'FRUIT' | 'DRINK' | 'SNACK' | 'FAT';
  tags: string[];
}

export const FOOD_DATABASE: FoodItem[] = [
  // === PROTÉINES ===
  { name: 'chicken_breast', nameFr: 'Blanc de poulet (grillé)', portion: '150g', portionGrams: 150, calories: 248, protein: 46, carbs: 0, fat: 5, category: 'PROTEIN', tags: ['poulet', 'viande', 'blanc', 'grillé'] },
  { name: 'chicken_thigh', nameFr: 'Cuisse de poulet', portion: '150g', portionGrams: 150, calories: 300, protein: 32, carbs: 0, fat: 18, category: 'PROTEIN', tags: ['poulet', 'viande', 'cuisse'] },
  { name: 'tuna_can', nameFr: 'Thon en boîte (égoutté)', portion: '100g', portionGrams: 100, calories: 116, protein: 26, carbs: 0, fat: 1, category: 'PROTEIN', tags: ['thon', 'poisson', 'boîte'] },
  { name: 'salmon', nameFr: 'Saumon (grillé)', portion: '150g', portionGrams: 150, calories: 312, protein: 34, carbs: 0, fat: 18, category: 'PROTEIN', tags: ['saumon', 'poisson'] },
  { name: 'egg_boiled', nameFr: 'Oeuf dur', portion: '1 oeuf (60g)', portionGrams: 60, calories: 85, protein: 7, carbs: 0.5, fat: 6, category: 'PROTEIN', tags: ['oeuf', 'dur'] },
  { name: 'egg_scrambled', nameFr: 'Oeufs brouillés (2 oeufs)', portion: '2 oeufs (120g)', portionGrams: 120, calories: 190, protein: 14, carbs: 2, fat: 14, category: 'PROTEIN', tags: ['oeuf', 'brouillé', 'omelette'] },
  { name: 'beef_ground', nameFr: 'Viande hachée (boeuf)', portion: '150g', portionGrams: 150, calories: 330, protein: 30, carbs: 0, fat: 22, category: 'PROTEIN', tags: ['boeuf', 'viande', 'haché'] },
  { name: 'sardines', nameFr: 'Sardines (en boîte)', portion: '100g', portionGrams: 100, calories: 208, protein: 25, carbs: 0, fat: 11, category: 'PROTEIN', tags: ['sardine', 'poisson'] },
  { name: 'merguez', nameFr: 'Merguez (grillée)', portion: '2 pièces (100g)', portionGrams: 100, calories: 290, protein: 17, carbs: 2, fat: 24, category: 'PROTEIN', tags: ['merguez', 'saucisse'] },
  { name: 'lentils', nameFr: 'Lentilles (cuites)', portion: '150g', portionGrams: 150, calories: 174, protein: 13, carbs: 30, fat: 0.5, category: 'PROTEIN', tags: ['lentilles', 'légumineuses'] },
  { name: 'chickpeas', nameFr: 'Pois chiches (cuits)', portion: '150g', portionGrams: 150, calories: 246, protein: 13, carbs: 41, fat: 4, category: 'PROTEIN', tags: ['pois', 'chiches', 'légumineuses'] },
  { name: 'tofu', nameFr: 'Tofu ferme', portion: '100g', portionGrams: 100, calories: 83, protein: 9, carbs: 2, fat: 4, category: 'PROTEIN', tags: ['tofu', 'végétarien'] },

  // === GLUCIDES / FÉCULENTS ===
  { name: 'white_rice', nameFr: 'Riz blanc (cuit)', portion: '180g (assiette)', portionGrams: 180, calories: 234, protein: 4, carbs: 52, fat: 0.4, category: 'CARBS', tags: ['riz', 'blanc', 'féculents'] },
  { name: 'brown_rice', nameFr: 'Riz complet (cuit)', portion: '180g', portionGrams: 180, calories: 216, protein: 5, carbs: 45, fat: 1.8, category: 'CARBS', tags: ['riz', 'complet'] },
  { name: 'pasta', nameFr: 'Pâtes (cuites)', portion: '180g', portionGrams: 180, calories: 270, protein: 9, carbs: 54, fat: 1.4, category: 'CARBS', tags: ['pâtes', 'féculents', 'spaghetti'] },
  { name: 'couscous', nameFr: 'Couscous (cuit)', portion: '180g', portionGrams: 180, calories: 270, protein: 6, carbs: 56, fat: 0.5, category: 'CARBS', tags: ['couscous', 'semoule'] },
  { name: 'bread_white', nameFr: 'Pain blanc (baguette)', portion: '1 tranche (40g)', portionGrams: 40, calories: 105, protein: 3, carbs: 22, fat: 0.7, category: 'CARBS', tags: ['pain', 'blanc', 'baguette'] },
  { name: 'bread_whole', nameFr: 'Pain complet', portion: '1 tranche (35g)', portionGrams: 35, calories: 83, protein: 4, carbs: 16, fat: 1, category: 'CARBS', tags: ['pain', 'complet', 'intégral'] },
  { name: 'oats', nameFr: 'Flocons d\'avoine', portion: '60g (bol)', portionGrams: 60, calories: 228, protein: 8, carbs: 39, fat: 4, category: 'CARBS', tags: ['avoine', 'flocons', 'céréales', 'porridge'] },
  { name: 'potato', nameFr: 'Pomme de terre (vapeur)', portion: '200g', portionGrams: 200, calories: 154, protein: 4, carbs: 35, fat: 0.2, category: 'CARBS', tags: ['pomme', 'terre', 'patate'] },
  { name: 'sweet_potato', nameFr: 'Patate douce (cuite)', portion: '200g', portionGrams: 200, calories: 180, protein: 3, carbs: 42, fat: 0.2, category: 'CARBS', tags: ['patate', 'douce', 'sweet'] },
  { name: 'corn', nameFr: 'Maïs (cuit)', portion: '150g', portionGrams: 150, calories: 173, protein: 5, carbs: 37, fat: 2, category: 'CARBS', tags: ['maïs', 'corn'] },
  { name: 'bsissa', nameFr: 'Bsissa (farine grillée)', portion: '50g', portionGrams: 50, calories: 183, protein: 8, carbs: 30, fat: 4, category: 'CARBS', tags: ['bsissa', 'tunisien', 'traditionnel'] },
  { name: 'khobz_tabouna', nameFr: 'Pain Tabouna', portion: '1 galette (100g)', portionGrams: 100, calories: 265, protein: 9, carbs: 53, fat: 2, category: 'CARBS', tags: ['tabouna', 'pain', 'tunisien'] },

  // === PRODUITS LAITIERS ===
  { name: 'milk_whole', nameFr: 'Lait entier', portion: '250ml (verre)', portionGrams: 250, calories: 155, protein: 8, carbs: 12, fat: 8, category: 'DAIRY', tags: ['lait', 'entier'] },
  { name: 'milk_skim', nameFr: 'Lait écrémé', portion: '250ml', portionGrams: 250, calories: 90, protein: 9, carbs: 13, fat: 0.4, category: 'DAIRY', tags: ['lait', 'écrémé', '0%'] },
  { name: 'yogurt_plain', nameFr: 'Yaourt nature', portion: '1 pot (125g)', portionGrams: 125, calories: 75, protein: 5, carbs: 9, fat: 2, category: 'DAIRY', tags: ['yaourt', 'nature', 'yoplait'] },
  { name: 'greek_yogurt', nameFr: 'Yaourt grec', portion: '1 pot (150g)', portionGrams: 150, calories: 132, protein: 12, carbs: 7, fat: 6, category: 'DAIRY', tags: ['yaourt', 'grec', 'skyr', 'protéines'] },
  { name: 'cottage_cheese', nameFr: 'Fromage blanc (0%)', portion: '150g', portionGrams: 150, calories: 90, protein: 12, carbs: 5, fat: 0.2, category: 'DAIRY', tags: ['fromage', 'blanc', 'maigre'] },
  { name: 'cheese_slice', nameFr: 'Fromage (tranche)', portion: '1 tranche (25g)', portionGrams: 25, calories: 85, protein: 5, carbs: 0.5, fat: 7, category: 'DAIRY', tags: ['fromage', 'tranche', 'edam'] },

  // === FRUITS ===
  { name: 'banana', nameFr: 'Banane', portion: '1 banane (120g)', portionGrams: 120, calories: 107, protein: 1.3, carbs: 27, fat: 0.4, category: 'FRUIT', tags: ['banane', 'énergie', 'avant séance'] },
  { name: 'orange', nameFr: 'Orange', portion: '1 orange (150g)', portionGrams: 150, calories: 72, protein: 1.4, carbs: 18, fat: 0.2, category: 'FRUIT', tags: ['orange', 'vitamine c', 'agrume'] },
  { name: 'apple', nameFr: 'Pomme', portion: '1 pomme (150g)', portionGrams: 150, calories: 80, protein: 0.4, carbs: 21, fat: 0.2, category: 'FRUIT', tags: ['pomme', 'fruit'] },
  { name: 'dates', nameFr: 'Dattes (Deglet Nour)', portion: '3 dattes (30g)', portionGrams: 30, calories: 85, protein: 0.6, carbs: 23, fat: 0.1, category: 'FRUIT', tags: ['dattes', 'dattier', 'tunisie', 'energie'] },
  { name: 'watermelon', nameFr: 'Pastèque', portion: '300g (tranche)', portionGrams: 300, calories: 90, protein: 2, carbs: 23, fat: 0.5, category: 'FRUIT', tags: ['pasteque', 'pastèque', 'été'] },
  { name: 'grapes', nameFr: 'Raisin', portion: '150g (grappe)', portionGrams: 150, calories: 104, protein: 1, carbs: 27, fat: 0.2, category: 'FRUIT', tags: ['raisin', 'sucre'] },
  { name: 'fig_fresh', nameFr: 'Figues (fraîches)', portion: '3 figues (120g)', portionGrams: 120, calories: 87, protein: 1, carbs: 23, fat: 0.3, category: 'FRUIT', tags: ['figue', 'fraîche'] },
  { name: 'strawberry', nameFr: 'Fraises', portion: '150g (bol)', portionGrams: 150, calories: 48, protein: 1, carbs: 11, fat: 0.5, category: 'FRUIT', tags: ['fraise', 'baies'] },
  { name: 'mango', nameFr: 'Mangue', portion: '150g', portionGrams: 150, calories: 100, protein: 1.5, carbs: 25, fat: 0.5, category: 'FRUIT', tags: ['mangue', 'tropical'] },

  // === LÉGUMES ===
  { name: 'tomato', nameFr: 'Tomate', portion: '1 tomate (150g)', portionGrams: 150, calories: 27, protein: 1.3, carbs: 5.8, fat: 0.3, category: 'VEGGIE', tags: ['tomate', 'salade'] },
  { name: 'cucumber', nameFr: 'Concombre', portion: '150g', portionGrams: 150, calories: 22, protein: 1, carbs: 4, fat: 0.1, category: 'VEGGIE', tags: ['concombre'] },
  { name: 'green_salad', nameFr: 'Salade verte (bol)', portion: '80g', portionGrams: 80, calories: 14, protein: 1, carbs: 2, fat: 0.2, category: 'VEGGIE', tags: ['salade', 'verte', 'laitue'] },
  { name: 'spinach', nameFr: 'Épinards (cuits)', portion: '150g', portionGrams: 150, calories: 35, protein: 4, carbs: 3.5, fat: 0.5, category: 'VEGGIE', tags: ['épinards', 'legume'] },
  { name: 'broccoli', nameFr: 'Brocolis (cuits)', portion: '150g', portionGrams: 150, calories: 52, protein: 5, carbs: 8, fat: 0.7, category: 'VEGGIE', tags: ['brocoli', 'vert'] },
  { name: 'carrot', nameFr: 'Carottes (crues)', portion: '100g', portionGrams: 100, calories: 41, protein: 1, carbs: 10, fat: 0.2, category: 'VEGGIE', tags: ['carotte', 'légume'] },
  { name: 'chorba', nameFr: 'Chorba (bol)', portion: '350ml', portionGrams: 350, calories: 280, protein: 18, carbs: 32, fat: 8, category: 'VEGGIE', tags: ['chorba', 'soupe', 'tunisien', 'frik'] },

  // === COLLATIONS SPORT ===
  { name: 'protein_bar', nameFr: 'Barre protéinée', portion: '1 barre (60g)', portionGrams: 60, calories: 224, protein: 20, carbs: 25, fat: 5, category: 'SNACK', tags: ['barre', 'protéine', 'sport', 'collation'] },
  { name: 'sport_drink', nameFr: 'Boisson isotonique', portion: '500ml', portionGrams: 500, calories: 135, protein: 0, carbs: 34, fat: 0, category: 'DRINK', tags: ['boisson', 'sport', 'isotonique', 'gatorade'] },
  { name: 'almond', nameFr: 'Amandes', portion: '30g (poignée)', portionGrams: 30, calories: 175, protein: 5, carbs: 5, fat: 15, category: 'SNACK', tags: ['amande', 'noix', 'oléagineux'] },
  { name: 'peanut_butter', nameFr: 'Beurre de cacahuète', portion: '2 c. à soupe (30g)', portionGrams: 30, calories: 190, protein: 8, carbs: 7, fat: 16, category: 'FAT', tags: ['cacahuète', 'beurre', 'arachide'] },
  { name: 'honey', nameFr: 'Miel', portion: '1 c. à soupe (20g)', portionGrams: 20, calories: 61, protein: 0.1, carbs: 17, fat: 0, category: 'CARBS', tags: ['miel', 'sucre', 'energie'] },
  { name: 'trail_mix', nameFr: 'Mix noix et raisins secs', portion: '40g', portionGrams: 40, calories: 195, protein: 5, carbs: 22, fat: 11, category: 'SNACK', tags: ['noix', 'raisins', 'mélange', 'collation'] },

  // === BOISSONS ===
  { name: 'water', nameFr: 'Eau', portion: '500ml', portionGrams: 500, calories: 0, protein: 0, carbs: 0, fat: 0, category: 'DRINK', tags: ['eau', 'eau minérale'] },
  { name: 'orange_juice', nameFr: 'Jus d\'orange frais', portion: '250ml', portionGrams: 250, calories: 113, protein: 1.7, carbs: 27, fat: 0.5, category: 'DRINK', tags: ['jus', 'orange', 'frais'] },
  { name: 'milk_chocolate', nameFr: 'Lait chocolaté (récup)', portion: '250ml', portionGrams: 250, calories: 210, protein: 8, carbs: 32, fat: 6, category: 'DRINK', tags: ['lait', 'chocolat', 'récupération'] },
  { name: 'smoothie_banana', nameFr: 'Smoothie banane-lait', portion: '300ml', portionGrams: 300, calories: 245, protein: 8, carbs: 48, fat: 3, category: 'DRINK', tags: ['smoothie', 'banane', 'lait'] },

  // === PLATS TUNISIENS COMPLETS ===
  { name: 'tajine_tunisien', nameFr: 'Tajine au thon (tunisien)', portion: '1 part (200g)', portionGrams: 200, calories: 380, protein: 28, carbs: 22, fat: 18, category: 'PROTEIN', tags: ['tajine', 'tunisien', 'thon', 'oeufs'] },
  { name: 'brik', nameFr: 'Brik à l\'oeuf', portion: '1 brik (120g)', portionGrams: 120, calories: 280, protein: 12, carbs: 22, fat: 17, category: 'SNACK', tags: ['brik', 'tunisien', 'oeuf'] },
  { name: 'shakshuka', nameFr: 'Chakchouka', portion: '1 part (300g)', portionGrams: 300, calories: 310, protein: 18, carbs: 25, fat: 14, category: 'PROTEIN', tags: ['chakchouka', 'shakshuka', 'oeuf', 'tomate'] },
  { name: 'couscous_complet', nameFr: 'Couscous complet (poulet + légumes)', portion: '1 assiette (450g)', portionGrams: 450, calories: 620, protein: 40, carbs: 82, fat: 12, category: 'CARBS', tags: ['couscous', 'poulet', 'légumes', 'complet'] },
  { name: 'fricasse_pain', nameFr: 'Fricassé (sandwich tunisien)', portion: '1 fricassé (150g)', portionGrams: 150, calories: 380, protein: 14, carbs: 40, fat: 18, category: 'SNACK', tags: ['fricassé', 'sandwich', 'tunisien'] },
  { name: 'mlokheya', nameFr: 'Mloukhia (plat complet)', portion: '1 part avec riz (400g)', portionGrams: 400, calories: 490, protein: 32, carbs: 55, fat: 14, category: 'PROTEIN', tags: ['mloukhia', 'mlokheya', 'tunisien'] },
  { name: 'osban', nameFr: 'Osban (saucisse farcie)', portion: '2 pièces (150g)', portionGrams: 150, calories: 420, protein: 22, carbs: 25, fat: 26, category: 'PROTEIN', tags: ['osban', 'tunisien', 'saucisse'] },
];

/**
 * Search foods by text query
 */
export function searchFoods(query: string): FoodItem[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return FOOD_DATABASE.filter(f =>
    f.nameFr.toLowerCase().includes(q) ||
    f.tags.some(t => t.includes(q))
  ).slice(0, 8);
}

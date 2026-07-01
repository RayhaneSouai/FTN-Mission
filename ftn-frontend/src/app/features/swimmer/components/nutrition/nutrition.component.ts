import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OpenFoodFactsService } from '../../services/open-food-facts.service';
import { searchFoods } from '../../data/food-database';
import { MEAL_CONTEXTS, MealContext } from '../../data/meal-proposals.data';
import { SpoonacularService, SpoonacularRecipe } from '../../services/spoonacular.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

export interface UnifiedFoodResult {
  id: string;
  name: string;
  image?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'local' | 'spoonacular_recipe' | 'spoonacular_ingredient';
  spoonacularId?: number;
  recipeUrl?: string;
}

@Component({
  selector: 'app-swimmer-nutrition',
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.css']
})
export class NutritionComponent implements OnInit {

  // Backend data
  foodEntries: any[] = [];

  // Form
  newFood = { foodName: '', mealType: 'LUNCH', calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 };
  barcodeInput = '';
  isScanning = false;
  scanError: string | null = null;
  allergyAlert: string | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  // Search
  foodSearchQuery = '';
  unifiedResults: UnifiedFoodResult[] = [];
  showSearchDropdown = false;
  isSearching = false;
  private searchSubject = new Subject<string>();

  // Input mode
  inputMode: 'search' | 'scan' | 'voice' = 'search';
  isListening = false;

  // Cuisine filter
  selectedCuisine = '';
  cuisines = [
    { value: '', label: '🌍 Tous' },
    { value: 'mediterranean', label: '🫒 Méditerranéenne' },
    { value: 'middle eastern', label: '🥙 Moyen-Orient' },
    { value: 'african', label: '🌍 Africaine' },
    { value: 'french', label: '🥐 Française' },
    { value: 'italian', label: '🍝 Italienne' },
    { value: 'asian', label: '🍜 Asiatique' },
    { value: 'indian', label: '🍛 Indienne' },
    { value: 'mexican', label: '🌮 Mexicaine' },
  ];

  // Proposals (Spoonacular)
  mealContexts = MEAL_CONTEXTS;
  mealContextKeys = Object.keys(MEAL_CONTEXTS) as MealContext[];
  selectedContext: MealContext | null = null;
  filteredProposals: UnifiedFoodResult[] = [];
  isLoadingProposals = false;

  // Tabs
  activeTab: 'goal' | 'proposals' | 'saisie' | 'journal' = 'goal';

  // ═══════════════════════════════════════
  // PROFIL NAGEUR (Mifflin-St Jeor)
  // ═══════════════════════════════════════
  profile = {
    weight: 70,       // kg
    height: 175,      // cm
    age: 20,          // years
    gender: 'male',   // male | female
    trainingMinutes: 90,      // session duration today
    trainingIntensity: 8      // MET value (moderate swimming = 8)
  };

  // Goal
  selectedGoal: 'WEIGHT_LOSS' | 'MAINTENANCE' | 'PERFORMANCE' | 'MUSCLE_GAIN' = 'PERFORMANCE';

  // Targets (computed by recalculate)
  targetMacros = { calories: 2800, protein: 140, carbs: 400, fat: 70 };
  waterTarget = 3000;

  // Hydration
  waterConsumed = 0;

  // Allergies
  myAllergies = { gluten: false, milk: false, peanuts: false, eggs: false, nuts: false };

  get Math() { return Math; }

  constructor(
    private http: HttpClient,
    private offService: OpenFoodFactsService,
    private spoonacular: SpoonacularService
  ) {}

  ngOnInit() {
    this.loadProfileFromStorage();
    this.recalculateScientific();
    this.loadFoodEntries();
    this.selectContext('PRE_TRAINING');
    this.initSearchStream();
  }

  // ═══════════════════════════════════════
  // PROFIL — load from localStorage user
  // ═══════════════════════════════════════
  loadProfileFromStorage() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.birthDate || user.birth_date) {
          const bd = new Date(user.birthDate || user.birth_date);
          const now = new Date();
          this.profile.age = now.getFullYear() - bd.getFullYear();
        }
        if (user.gender) {
          this.profile.gender = user.gender.toLowerCase() === 'female' || user.gender === 'FEMME' ? 'female' : 'male';
        }
        const nutrStr = localStorage.getItem('nutritionProfile');
        if (nutrStr) {
          const saved = JSON.parse(nutrStr);
          this.profile.weight = saved.weight ?? this.profile.weight;
          this.profile.height = saved.height ?? this.profile.height;
          this.profile.age = saved.age ?? this.profile.age;
          this.profile.gender = saved.gender ?? this.profile.gender;
          this.profile.trainingMinutes = saved.trainingMinutes ?? this.profile.trainingMinutes;
          this.profile.trainingIntensity = saved.trainingIntensity ?? this.profile.trainingIntensity;
          if (saved.selectedGoal) this.selectedGoal = saved.selectedGoal;
        }
      }
    } catch (e) {}
  }

  onProfileChange() {
    this.recalculateScientific();
  }

  saveProfile() {
    localStorage.setItem('nutritionProfile', JSON.stringify({
      ...this.profile,
      selectedGoal: this.selectedGoal
    }));
    this.recalculateScientific();
    if (this.selectedContext) this.fetchDynamicProposals(this.selectedContext);
  }

  // ═══════════════════════════════════════
  // CALCULS SCIENTIFIQUES
  // ═══════════════════════════════════════
  /**
   * Mifflin-St Jeor BMR
   * Homme : 10 × poids + 6.25 × taille − 5 × âge + 5
   * Femme  : 10 × poids + 6.25 × taille − 5 × âge − 161
   */
  getBMR(): number {
    const base = 10 * this.profile.weight + 6.25 * this.profile.height - 5 * this.profile.age;
    return Math.round(this.profile.gender === 'male' ? base + 5 : base - 161);
  }

  /**
   * Session energy expenditure via MET
   * MET × weight(kg) × duration(h)
   */
  getSessionKcal(): number {
    const hours = this.profile.trainingMinutes / 60;
    return Math.round(this.profile.trainingIntensity * this.profile.weight * hours);
  }

  /**
   * Total daily energy need = BMR + session
   * Then apply goal modifier
   */
  getTDEE(): number {
    const base = this.getBMR() + this.getSessionKcal();
    const mods: Record<string, number> = {
      WEIGHT_LOSS: 0.85,
      MAINTENANCE: 1.0,
      PERFORMANCE: 1.1,
      MUSCLE_GAIN: 1.15
    };
    return Math.round(base * (mods[this.selectedGoal] ?? 1.0));
  }

  /**
   * Recalculate all targets from profile + goal (scientific formulas)
   */
  recalculateScientific() {
    const kcal = this.getTDEE();

    // Protein: 1.6g–2g × weight based on goal
    const proteinMults: Record<string, number> = {
      WEIGHT_LOSS: 1.8,
      MAINTENANCE: 1.6,
      PERFORMANCE: 1.8,
      MUSCLE_GAIN: 2.0
    };
    const protein = Math.round(proteinMults[this.selectedGoal] * this.profile.weight);

    // Fat: 25–30% of calories
    const fat = Math.round((kcal * 0.27) / 9);

    // Carbs: rest of calories
    const proteinKcal = protein * 4;
    const fatKcal = fat * 9;
    const carbs = Math.round((kcal - proteinKcal - fatKcal) / 4);

    // Water: 33ml × weight + 500ml per 30min training
    const waterBase = Math.round(33 * this.profile.weight);
    const waterTraining = Math.round((this.profile.trainingMinutes / 30) * 500);
    this.waterTarget = waterBase + waterTraining;

    this.targetMacros = { calories: kcal, protein, carbs: Math.max(0, carbs), fat };
  }

  selectGoal(goal: 'WEIGHT_LOSS' | 'MAINTENANCE' | 'PERFORMANCE' | 'MUSCLE_GAIN') {
    this.selectedGoal = goal;
    this.recalculateScientific();
  }

  getGoalLabel(): string {
    const labels: Record<string, string> = {
      WEIGHT_LOSS: 'Perte de poids',
      MAINTENANCE: 'Maintien',
      PERFORMANCE: 'Performance',
      MUSCLE_GAIN: 'Prise de masse'
    };
    return labels[this.selectedGoal] || '';
  }

  getGoalRecommendation(): string {
    const recs: Record<string, string> = {
      WEIGHT_LOSS: `Déficit de 15 % — visez ${this.targetMacros.calories} kcal/jour avec ${this.targetMacros.protein}g de protéines pour préserver la masse musculaire.`,
      MAINTENANCE: `Équilibre calorique — ${this.targetMacros.calories} kcal/jour répartis en ${this.targetMacros.protein}g protéines, ${this.targetMacros.carbs}g glucides et ${this.targetMacros.fat}g lipides.`,
      PERFORMANCE: `Surplus modéré (+10 %) — ${this.targetMacros.calories} kcal/jour, glucides élevés (${this.targetMacros.carbs}g) pour alimenter vos séances de natation.`,
      MUSCLE_GAIN: `Surplus de 15 % — ${this.targetMacros.calories} kcal/jour avec ${this.targetMacros.protein}g de protéines (2g/kg) pour la prise de masse.`
    };
    return recs[this.selectedGoal] || '';
  }

  // ═══════════════════════════════════════
  // BACKEND
  // ═══════════════════════════════════════
  private get userId(): number {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.id || u.idUser || 1;
    } catch { return 1; }
  }

  loadFoodEntries() {
    this.http.get<any[]>(`http://localhost:8083/ftn/api/nutrition/food/${this.userId}/${this.selectedDate}`)
      .subscribe({
        next: data => { this.foodEntries = data; this.recalcWater(); },
        error: () => {}
      });
  }

  recalcWater() {
    this.waterConsumed = this.foodEntries.reduce((t, e) => t + (e.waterMl || 0), 0);
  }

  addWater(ml: number) {
    const payload = { foodName: `Eau (${ml}ml)`, mealType: 'SNACK', calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: ml, userId: this.userId, entryDate: this.selectedDate };
    this.http.post('http://localhost:8083/ftn/api/nutrition/food', payload)
      .subscribe({ next: () => this.loadFoodEntries() });
  }

  addFood() {
    if (!this.newFood.foodName) return;
    const payload = { ...this.newFood, userId: this.userId, entryDate: this.selectedDate };
    this.http.post('http://localhost:8083/ftn/api/nutrition/food', payload)
      .subscribe({
        next: () => {
          this.newFood = { foodName: '', mealType: 'LUNCH', calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 };
          this.foodSearchQuery = '';
          this.showSearchDropdown = false;
          this.allergyAlert = null;
          this.loadFoodEntries();
          this.activeTab = 'journal';
        }
      });
  }

  deleteFood(id: number) {
    this.http.delete(`http://localhost:8083/ftn/api/nutrition/food/${id}`).subscribe({
      next: () => this.loadFoodEntries()
    });
  }

  aiRecommendation: string | null = null;
  isLoadingAi = false;

  getAiAdvice() {
    this.isLoadingAi = true;
    this.aiRecommendation = null;

    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;
    
    this.foodEntries.forEach(f => {
      consumedCalories += f.calories || 0;
      consumedProtein += f.protein || 0;
      consumedCarbs += f.carbs || 0;
      consumedFat += f.fat || 0;
    });

    const payload = {
      goal: this.selectedGoal,
      weight: this.profile.weight,
      height: this.profile.height,
      age: this.profile.age,
      gender: this.profile.gender === 'male' ? 'M' : 'F',
      consumedCalories,
      targetCalories: this.targetMacros.calories,
      consumedProtein,
      targetProtein: this.targetMacros.protein,
      consumedCarbs,
      targetCarbs: this.targetMacros.carbs,
      trainingMinutes: this.profile.trainingMinutes,
      metValue: this.profile.trainingIntensity
    };

    this.http.post<{recommendation: string}>('http://localhost:8083/ftn/api/nutrition/ai-recommendation', payload).subscribe({
      next: (res) => {
        this.aiRecommendation = res.recommendation;
        this.isLoadingAi = false;
      },
      error: () => {
        this.isLoadingAi = false;
        this.aiRecommendation = "<p>Erreur lors de la génération du conseil.</p>";
      }
    });
  }

  onDateChange(e: any) {
    this.selectedDate = e.target.value;
    this.loadFoodEntries();
  }

  // ═══════════════════════════════════════
  // SEARCH (local + Spoonacular)
  // ═══════════════════════════════════════
  initSearchStream() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.unifiedResults = [];
          this.showSearchDropdown = false;
          this.resetMealMacros();
          return of([]);
        }
        this.isSearching = true;
        const local = searchFoods(query).slice(0, 5).map(f => ({
          id: `local-${f.nameFr}`,
          name: f.nameFr,
          calories: Math.round(f.calories),
          protein: Math.round(f.protein),
          carbs: Math.round(f.carbs),
          fat: Math.round(f.fat),
          source: 'local' as const
        }));
        this.unifiedResults = local;
        this.showSearchDropdown = local.length > 0;
        this.autoLookupMacros(query, local);
        return this.spoonacular.searchRecipes(query, this.selectedCuisine, undefined, 8);
      })
    ).subscribe({
      next: (recipes: SpoonacularRecipe[]) => {
        this.isSearching = false;
        const spoon: UnifiedFoodResult[] = recipes.map(r => {
          const m = this.spoonacular.extractMacros(r);
          return { id: `r-${r.id}`, name: r.title, image: r.image, ...m, source: 'spoonacular_recipe' as const, spoonacularId: r.id };
        });
        this.unifiedResults = [...this.unifiedResults.filter(x => x.source === 'local'), ...spoon];
        this.showSearchDropdown = this.unifiedResults.length > 0;
        if (this.newFood.calories === 0 && spoon.length > 0 && this.foodSearchQuery.length >= 3) {
          this.applyFoodMacros(spoon[0]);
        }
      },
      error: () => { this.isSearching = false; }
    });
  }

  onFoodSearchInput() {
    this.newFood.foodName = this.foodSearchQuery;
    this.searchSubject.next(this.foodSearchQuery);
  }

  onMealNameChange() {
    this.foodSearchQuery = this.newFood.foodName;
    if (this.newFood.foodName.trim().length >= 2) {
      const local = searchFoods(this.newFood.foodName).slice(0, 5).map(f => ({
        id: `local-${f.nameFr}`,
        name: f.nameFr,
        calories: Math.round(f.calories),
        protein: Math.round(f.protein),
        carbs: Math.round(f.carbs),
        fat: Math.round(f.fat),
        source: 'local' as const
      }));
      this.autoLookupMacros(this.newFood.foodName, local);
    } else {
      this.resetMealMacros();
    }
  }

  private resetMealMacros() {
    this.newFood.calories = 0;
    this.newFood.protein = 0;
    this.newFood.carbs = 0;
    this.newFood.fat = 0;
  }

  private applyFoodMacros(food: { name: string; calories: number; protein: number; carbs: number; fat: number }) {
    this.newFood.foodName = food.name;
    this.newFood.calories = food.calories;
    this.newFood.protein = food.protein;
    this.newFood.carbs = food.carbs;
    this.newFood.fat = food.fat;
    this.foodSearchQuery = food.name;
  }

  private autoLookupMacros(query: string, localResults: UnifiedFoodResult[]) {
    const q = query.toLowerCase().trim();
    if (q.length < 2) {
      this.resetMealMacros();
      return;
    }
    const exact = localResults.find(f => f.name.toLowerCase() === q);
    const partial = localResults.find(f => f.name.toLowerCase().includes(q));
    const best = exact || partial;
    if (best) {
      this.applyFoodMacros(best);
    } else if (localResults.length === 0) {
      this.resetMealMacros();
    }
  }
  onCuisineChange() { if (this.foodSearchQuery.length >= 2) this.onFoodSearchInput(); }

  selectFoodFromResults(food: UnifiedFoodResult) {
    this.applyFoodMacros(food);
    this.showSearchDropdown = false;
    this.allergyAlert = null;
  }

  // ═══════════════════════════════════════
  // BARCODE
  // ═══════════════════════════════════════
  scanBarcode() {
    if (!this.barcodeInput.trim()) return;
    this.isScanning = true; this.scanError = null;
    this.offService.getProductByBarcode(this.barcodeInput.trim()).subscribe({
      next: p => {
        this.isScanning = false;
        if (p) {
          this.applyFoodMacros({
            name: p.productName,
            calories: Math.round(p.calories),
            protein: Math.round(p.protein),
            carbs: Math.round(p.carbs),
            fat: Math.round(p.fat)
          });
          this.barcodeInput = '';
        } else { this.scanError = 'Produit non trouvé.'; }
      },
      error: () => { this.isScanning = false; this.scanError = 'Erreur réseau.'; }
    });
  }

  // ═══════════════════════════════════════
  // VOICE
  // ═══════════════════════════════════════
  startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) { alert('Utilisez Chrome ou Edge.'); return; }
    this.isListening = true;
    const r = new (window as any).webkitSpeechRecognition();
    r.lang = 'fr-FR'; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: any) => {
      this.foodSearchQuery = e.results[0][0].transcript;
      this.isListening = false;
      this.inputMode = 'search';
      this.onFoodSearchInput();
    };
    r.onerror = r.onend = () => { this.isListening = false; };
    r.start();
  }

  // ═══════════════════════════════════════
  // PROPOSALS (Spoonacular by macros)
  // ═══════════════════════════════════════
  selectContext(ctx: MealContext) {
    this.selectedContext = ctx;
    this.fetchDynamicProposals(ctx);
  }

  getContextInfo(key: MealContext) { return this.mealContexts[key]; }

  fetchDynamicProposals(ctx: MealContext) {
    this.isLoadingProposals = true;
    const ratios: Record<MealContext, number> = {
      PRE_TRAINING: 0.25,
      POST_TRAINING: 0.35,
      COMPETITION: 0.40,
      REST_DAY: 0.30
    } as any;
    const ratio = (ratios as any)[ctx] ?? 0.30;
    const c = Math.round(this.targetMacros.carbs * ratio);
    const p = Math.round(this.targetMacros.protein * ratio);
    const f = Math.round(this.targetMacros.fat * ratio);

    this.spoonacular.searchRecipesByMacros(c, p, f, this.selectedCuisine, 4).subscribe({
      next: recipes => {
        this.filteredProposals = recipes.map(r => {
          const m = this.spoonacular.extractMacros(r);
          return { id: `r-${r.id}`, name: r.title, image: r.image, ...m, source: 'spoonacular_recipe' as const, spoonacularId: r.id, recipeUrl: r.sourceUrl };
        });
        this.isLoadingProposals = false;
      },
      error: () => { this.isLoadingProposals = false; this.filteredProposals = []; }
    });
  }

  useMealProposal(meal: UnifiedFoodResult) {
    this.applyFoodMacros(meal);
    this.activeTab = 'saisie';
  }

  // ═══════════════════════════════════════
  // ALLERGIES
  // ═══════════════════════════════════════
  toggleAllergy(k: keyof typeof this.myAllergies) { this.myAllergies[k] = !this.myAllergies[k]; }

  // ═══════════════════════════════════════
  // DASHBOARD STATS
  // ═══════════════════════════════════════
  getTotalCalories() { return Math.round(this.foodEntries.reduce((s, e) => s + (e.calories || 0), 0)); }
  getTotalProtein() { return Math.round(this.foodEntries.reduce((s, e) => s + (e.protein || 0), 0)); }
  getTotalCarbs() { return Math.round(this.foodEntries.reduce((s, e) => s + (e.carbs || 0), 0)); }
  getTotalFat() { return Math.round(this.foodEntries.reduce((s, e) => s + (e.fat || 0), 0)); }
  getCaloriePct() { return Math.min(100, Math.round((this.getTotalCalories() / this.targetMacros.calories) * 100)); }
  getProteinPct() { return Math.min(100, Math.round((this.getTotalProtein() / this.targetMacros.protein) * 100)); }
  getCarbPct() { return Math.min(100, Math.round((this.getTotalCarbs() / this.targetMacros.carbs) * 100)); }
  getFatPct() { return Math.min(100, Math.round((this.getTotalFat() / this.targetMacros.fat) * 100)); }
  getWaterPct() { return Math.min(100, Math.round((this.waterConsumed / this.waterTarget) * 100)); }
  getRemainingCalories() { return Math.max(0, this.targetMacros.calories - this.getTotalCalories()); }
  getRemainingProtein() { return Math.max(0, this.targetMacros.protein - this.getTotalProtein()); }
}

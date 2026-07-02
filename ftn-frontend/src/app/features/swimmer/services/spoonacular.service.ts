import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SpoonacularFood {
  id: number;
  name: string;
  nameFr?: string;
  image?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  source: 'spoonacular';
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  nutrition: {
    nutrients: Array<{ name: string; amount: number; unit: string }>;
  };
  cuisines?: string[];
  servings?: number;
  sourceUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class SpoonacularService {

  // ⚠️ Remplacez cette clé par la vôtre (gratuite sur spoonacular.com)
  private readonly API_KEY = 'YOUR_SPOONACULAR_API_KEY';
  private readonly BASE_URL = 'https://api.spoonacular.com';
  // Proxy CORS pour éviter les erreurs navigateur en développement
  private readonly PROXY = 'https://corsproxy.io/?';

  constructor(private http: HttpClient) {}

  /**
   * Recherche d'ingrédients/produits par mot-clé
   * Endpoint: /food/ingredients/search
   */
  searchIngredients(query: string, number = 15): Observable<SpoonacularFood[]> {
    const url = `${this.PROXY}${encodeURIComponent(
      `${this.BASE_URL}/food/ingredients/search?query=${query}&number=${number}&addChildren=false&apiKey=${this.API_KEY}`
    )}`;
    return this.http.get<any>(url).pipe(
      map(res => (res.results || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : undefined,
        calories: 0, protein: 0, carbs: 0, fat: 0,
        source: 'spoonacular' as const
      }))),
      catchError(() => of([]))
    );
  }

  /**
   * Récupère les infos nutritionnelles d'un ingrédient par ID
   * Endpoint: /food/ingredients/{id}/information
   */
  getIngredientNutrition(id: number, amount = 100, unit = 'grams'): Observable<SpoonacularFood | null> {
    const url = `${this.PROXY}${encodeURIComponent(
      `${this.BASE_URL}/food/ingredients/${id}/information?amount=${amount}&unit=${unit}&apiKey=${this.API_KEY}`
    )}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const getNutrient = (name: string) =>
          (res.nutrition?.nutrients || []).find((n: any) => n.name.toLowerCase() === name.toLowerCase())?.amount || 0;
        return {
          id: res.id,
          name: res.name,
          image: res.image ? `https://spoonacular.com/cdn/ingredients_100x100/${res.image}` : undefined,
          calories: Math.round(getNutrient('calories')),
          protein: Math.round(getNutrient('protein')),
          carbs: Math.round(getNutrient('carbohydrates')),
          fat: Math.round(getNutrient('fat')),
          servingSize: `${amount}${unit}`,
          source: 'spoonacular' as const
        };
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Recherche de recettes complètes avec macros incluses
   * Endpoint: /recipes/complexSearch
   * Supporte les cuisines : african, asian, chinese, french, italian, mediterranean,
   * middle eastern, mexican, indian, japanese, korean, thai, etc.
   */
  searchRecipes(query: string, cuisine?: string, diet?: string, number = 12): Observable<SpoonacularRecipe[]> {
    let params = `query=${encodeURIComponent(query)}&number=${number}&addRecipeNutrition=true&addRecipeInformation=true&apiKey=${this.API_KEY}`;
    if (cuisine) params += `&cuisine=${cuisine}`;
    if (diet) params += `&diet=${diet}`;

    const url = `${this.PROXY}${encodeURIComponent(`${this.BASE_URL}/recipes/complexSearch?${params}`)}`;
    return this.http.get<any>(url).pipe(
      map(res => res.results || []),
      catchError(() => of([]))
    );
  }

  /**
   * Recherche de produits alimentaires emballés
   * Endpoint: /food/products/search
   */
  searchProducts(query: string, number = 12): Observable<SpoonacularFood[]> {
    const url = `${this.PROXY}${encodeURIComponent(
      `${this.BASE_URL}/food/products/search?query=${query}&number=${number}&apiKey=${this.API_KEY}`
    )}`;
    return this.http.get<any>(url).pipe(
      map(res => (res.products || []).map((p: any) => ({
        id: p.id,
        name: p.title,
        image: p.image,
        calories: 0, protein: 0, carbs: 0, fat: 0,
        source: 'spoonacular' as const
      }))),
      catchError(() => of([]))
    );
  }

  /**
   * Détails nutritionnels d'un produit par ID
   * Endpoint: /food/products/{id}
   */
  getProductNutrition(id: number): Observable<SpoonacularFood | null> {
    const url = `${this.PROXY}${encodeURIComponent(
      `${this.BASE_URL}/food/products/${id}?apiKey=${this.API_KEY}`
    )}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const getNutrient = (name: string) =>
          (res.nutrition?.nutrients || []).find((n: any) => n.name.toLowerCase() === name.toLowerCase())?.amount || 0;
        return {
          id: res.id,
          name: res.title,
          image: res.image,
          calories: Math.round(getNutrient('calories')),
          protein: Math.round(getNutrient('protein')),
          carbs: Math.round(getNutrient('carbohydrates')),
          fat: Math.round(getNutrient('fat')),
          source: 'spoonacular' as const
        };
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Détails d'une recette par ID (avec macros complètes)
   */
  getRecipeNutrition(recipeId: number): Observable<{ calories: number; protein: number; carbs: number; fat: number } | null> {
    const url = `${this.PROXY}${encodeURIComponent(
      `${this.BASE_URL}/recipes/${recipeId}/nutritionWidget.json?apiKey=${this.API_KEY}`
    )}`;
    return this.http.get<any>(url).pipe(
      map(res => ({
        calories: Math.round(parseFloat(res.calories) || 0),
        protein: Math.round(parseFloat(res.protein) || 0),
        carbs: Math.round(parseFloat(res.carbs) || 0),
        fat: Math.round(parseFloat(res.fat) || 0),
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Analyse nutritionnelle d'une image de plat
   * Endpoint: /food/images/analyze
   * ⚠️ Nécessite l'envoi d'une image URL (pas encore disponible en mode file upload côté frontend)
   */
  analyzeImageUrl(imageUrl: string): Observable<SpoonacularFood | null> {
    const url = `${this.PROXY}${encodeURIComponent(
      `${this.BASE_URL}/food/images/analyze?imageUrl=${encodeURIComponent(imageUrl)}&apiKey=${this.API_KEY}`
    )}`;
    return this.http.get<any>(url).pipe(
      map(res => ({
        id: 0,
        name: res.category?.name || 'Plat identifié',
        image: imageUrl,
        calories: Math.round(res.nutrition?.calories?.value || 0),
        protein: Math.round(res.nutrition?.protein?.value || 0),
        carbs: Math.round(res.nutrition?.carbs?.value || 0),
        fat: Math.round(res.nutrition?.fat?.value || 0),
        source: 'spoonacular' as const
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Recherche de recettes dynamiques basées sur des cibles de macros
   * Endpoint: /recipes/complexSearch
   */
  searchRecipesByMacros(targetCarbs: number, targetProtein: number, targetFat: number, cuisine?: string, number = 4): Observable<SpoonacularRecipe[]> {
    if (this.API_KEY === 'YOUR_SPOONACULAR_API_KEY' || !this.API_KEY) {
      return of(this.getRealisticMockRecipes(targetCarbs, targetProtein, targetFat, cuisine).slice(0, number));
    }

    const minCarbs = Math.max(10, Math.round(targetCarbs * 0.5));
    const maxCarbs = Math.max(80, Math.round(targetCarbs * 2.0));
    const minProtein = Math.max(10, Math.round(targetProtein * 0.5));
    const maxProtein = Math.max(80, Math.round(targetProtein * 2.0));
    const minFat = Math.max(5, Math.round(targetFat * 0.3));
    const maxFat = Math.max(40, Math.round(targetFat * 2.5));

    let params = `number=${number}&minCarbs=${minCarbs}&maxCarbs=${maxCarbs}&minProtein=${minProtein}&maxProtein=${maxProtein}&minFat=${minFat}&maxFat=${maxFat}&addRecipeNutrition=true&apiKey=${this.API_KEY}`;
    if (cuisine) params += `&cuisine=${cuisine}`;

    const url = `${this.PROXY}${encodeURIComponent(`${this.BASE_URL}/recipes/complexSearch?${params}`)}`;
    return this.http.get<any>(url).pipe(
      map(res => res.results || []),
      catchError(() => of(this.getRealisticMockRecipes(targetCarbs, targetProtein, targetFat, cuisine).slice(0, number)))
    );
  }

  /** Convertit une recette Spoonacular en macro simplifié */
  extractMacros(recipe: SpoonacularRecipe): { calories: number; protein: number; carbs: number; fat: number } {
    const getNutrient = (name: string) => {
      const n = recipe.nutrition?.nutrients?.find(x => x.name.toLowerCase() === name.toLowerCase());
      return n ? Math.round(n.amount) : 0;
    };
    return {
      calories: getNutrient('Calories'),
      protein: getNutrient('Protein'),
      carbs: getNutrient('Carbohydrates'),
      fat: getNutrient('Fat')
    };
  }

  // --- LOCAL REALISTIC FALLBACK DB ---
  private getRealisticMockRecipes(tc: number, tp: number, tf: number, cuisine?: string): SpoonacularRecipe[] {
    const db = [
      { id: 1001, title: 'Bowl de Poulet Grillé & Quinoa', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80', c: 'mediterranean', base: { kcal: 550, p: 45, c: 50, f: 18 }, url: 'https://www.marmiton.org/recettes/recette_buddha-bowl-au-poulet_345749.aspx' },
      { id: 1002, title: 'Saumon Teriyaki & Riz Basmati', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80', c: 'asian', base: { kcal: 620, p: 40, c: 65, f: 22 }, url: 'https://www.marmiton.org/recettes/recette_saumon-teriyaki_22718.aspx' },
      { id: 1003, title: 'Omelette Protéinée aux Épinards', img: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500&q=80', c: 'french', base: { kcal: 350, p: 30, c: 5, f: 23 }, url: 'https://www.marmiton.org/recettes/recette_omelette-aux-epinards_18047.aspx' },
      { id: 1004, title: 'Pâtes Complètes au Bœuf Haché 5%', img: 'https://images.unsplash.com/photo-1621996316526-cee06fa636bd?w=500&q=80', c: 'italian', base: { kcal: 700, p: 55, c: 80, f: 15 }, url: 'https://www.marmiton.org/recettes/recette_spaghetti-bolognese_19219.aspx' },
      { id: 1005, title: 'Fajitas Poulet & Poivrons', img: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80', c: 'mexican', base: { kcal: 600, p: 48, c: 60, f: 18 }, url: 'https://www.marmiton.org/recettes/recette_fajitas-au-poulet_11270.aspx' },
      { id: 1006, title: 'Salade de Lentilles & Feta', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80', c: 'mediterranean', base: { kcal: 450, p: 22, c: 55, f: 16 }, url: 'https://www.marmiton.org/recettes/recette_salade-de-lentilles-a-la-feta_30594.aspx' },
      { id: 1007, title: 'Curry de Dinde au Lait de Coco', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80', c: 'indian', base: { kcal: 680, p: 50, c: 45, f: 32 }, url: 'https://www.marmiton.org/recettes/recette_curry-de-dinde-au-lait-de-coco_26673.aspx' },
      { id: 1008, title: 'Porridge Avoine & Chocolat', img: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&q=80', c: 'french', base: { kcal: 400, p: 35, c: 50, f: 8 }, url: 'https://www.marmiton.org/recettes/recette_porridge-flocons-d-avoine_22245.aspx' },
      { id: 1009, title: 'Steak de Thon & Patates Douces', img: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?w=500&q=80', c: 'mediterranean', base: { kcal: 580, p: 52, c: 65, f: 12 }, url: 'https://www.marmiton.org/recettes/recette_steak-de-thon-marine_12885.aspx' },
      { id: 1010, title: 'Burrito Bowl Végétarien (Tofu)', img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80', c: 'mexican', base: { kcal: 520, p: 28, c: 65, f: 16 }, url: 'https://www.marmiton.org/recettes/recette_burrito-bowl-vegetarien_345750.aspx' }
    ];

    // Filter by cuisine if specified
    let candidates = db;
    if (cuisine) {
      candidates = db.filter(r => r.c.toLowerCase() === cuisine.toLowerCase());
      if (candidates.length === 0) candidates = db; // fallback if no match
    }

    // Scale recipes to approximate the target macros
    // We scale based on protein to meet the athlete's needs, then adjust
    return candidates.map(r => {
      // Calculate a multiplier to reach the target protein, capped between 0.5x and 2.5x to remain realistic
      let scale = tp / r.base.p;
      scale = Math.max(0.5, Math.min(2.5, scale));

      const scaledCalories = Math.round(r.base.kcal * scale);
      const scaledProtein = Math.round(r.base.p * scale);
      const scaledCarbs = Math.round(r.base.c * scale);
      const scaledFat = Math.round(r.base.f * scale);

      return {
        id: r.id,
        title: `${r.title} (Portion ajustée)`,
        image: r.img,
        sourceUrl: r.url,
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: scaledCalories, unit: 'kcal' },
            { name: 'Protein', amount: scaledProtein, unit: 'g' },
            { name: 'Carbohydrates', amount: scaledCarbs, unit: 'g' },
            { name: 'Fat', amount: scaledFat, unit: 'g' }
          ]
        }
      };
    }).sort(() => 0.5 - Math.random()); // Randomize order a bit
  }
}

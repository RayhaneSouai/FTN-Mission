import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FoodProductInfo {
  productName: string;
  calories: number; // per 100g or serving
  protein: number;
  carbs: number;
  fat: number;
  allergens: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OpenFoodFactsService {

  // Use a CORS proxy because Open Food Facts blocks direct browser requests
  private readonly API_URL = 'https://corsproxy.io/?url=https://world.openfoodfacts.org/api/v0/product/';
  private readonly SEARCH_URL = 'https://corsproxy.io/?url=https://world.openfoodfacts.org/cgi/search.pl';


  constructor(private http: HttpClient) { }

  /**
   * Fetches product information by its barcode.
   */
  getProductByBarcode(barcode: string): Observable<FoodProductInfo | null> {
    return this.http.get<any>(`${this.API_URL}${barcode}.json`).pipe(
      map(response => {
        if (response.status === 1 && response.product) {
          const product = response.product;
          const nutriments = product.nutriments || {};
          const allergensTags: string[] = product.allergens_tags || [];
          
          // Clean up "en:gluten" to just "gluten"
          const cleanAllergens = allergensTags.map(tag => tag.replace(/^[a-z]{2}:/, '').toLowerCase());
          
          return {
            productName: product.product_name || product.product_name_fr || 'Produit inconnu',
            calories: nutriments['energy-kcal_100g'] || 0,
            protein: nutriments['proteins_100g'] || 0,
            carbs: nutriments['carbohydrates_100g'] || 0,
            fat: nutriments['fat_100g'] || 0,
            allergens: cleanAllergens
          };
        }
        return null;
      })
    );
  }
}

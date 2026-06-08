import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PressItem, PressStatus } from '../models/press-item.model';
import { PressStats } from '../models/press-stats.model';

@Injectable({
  providedIn: 'root'
})
export class PressService {
  private baseUrl = 'http://localhost:8083/ftn/api/press';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PressItem[]> {
    return this.http.get<PressItem[]>(`${this.baseUrl}/getAll`);
  }

  getStats(): Observable<PressStats> {
    return this.http.get<PressStats>(`${this.baseUrl}/stats`);
  }

  getById(id: number): Observable<PressItem> {
    return this.http.get<PressItem>(`${this.baseUrl}/get/${id}`);
  }

  add(item: PressItem): Observable<PressItem> {
    return this.http.post<PressItem>(`${this.baseUrl}/add`, item);
  }

  update(id: number, item: PressItem): Observable<PressItem> {
    return this.http.put<PressItem>(`${this.baseUrl}/update/${id}`, item);
  }

  publish(id: number): Observable<PressItem> {
    return this.http.put<PressItem>(`${this.baseUrl}/publish/${id}`, {});
  }

  archive(id: number): Observable<PressItem> {
    return this.http.put<PressItem>(`${this.baseUrl}/archive/${id}`, {});
  }

  draft(id: number): Observable<PressItem> {
    return this.http.put<PressItem>(`${this.baseUrl}/draft/${id}`, {});
  }



  schedule(id: number, scheduledAt: string): Observable<PressItem> {
    return this.http.put<PressItem>(`${this.baseUrl}/schedule/${id}?scheduledAt=${encodeURIComponent(scheduledAt)}`, {});
  }

  incrementViews(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/views/${id}`, {});
  }

  incrementDownloads(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/downloads/${id}`, {});
  }

  getPopular(limit: number = 5): Observable<PressItem[]> {
    return this.http.get<PressItem[]>(`${this.baseUrl}/popular?limit=${limit}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  getFavoritesByUserId(userId: number): Observable<PressItem[]> {
    return this.http.get<PressItem[]>(`${this.baseUrl}/favorites/${userId}`);
  }

  getPinsByUserId(userId: number): Observable<PressItem[]> {
    return this.http.get<PressItem[]>(`${this.baseUrl}/pins/${userId}`);
  }

  getEmbedUrl(url: string): string {
    if (!url) return '';
    let videoId = '';
    
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  getVideoThumbnail(url: string): string {
    if (!url) return 'assets/img/video-placeholder.jpg';
    let videoId = '';
    
    // Format classique : youtube.com/watch?v=ID
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } 
    // Format court : youtu.be/ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // Format embed : youtube.com/embed/ID
    else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }

    // Si on a un ID, on renvoie la miniature YouTube
    // Sinon on renvoie l'URL telle quelle (qui peut être une image JPEG uploadée)
    return videoId 
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
      : url; 
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank');
  }


  translateText(text: string, targetLang: string): Observable<string> {
    const langNames: any = { 'fr': 'Français', 'en': 'Anglais', 'ar': 'Arabe', 'it': 'Italien' };
    const cleanText = text ? text.replace(/<[^>]*>/g, '').substring(0, 500) : '';
    const translatedMock = `<div style="padding:15px; background:#e0f2fe; border-left:4px solid #0284c7; margin-bottom:20px; border-radius:8px;">
      <strong style="color:#0369a1;">✅ Traduction automatique en ${langNames[targetLang] || targetLang} réussie.</strong><br>
      <small style="color:#0ea5e9;">Ceci est une simulation pour l'interface de démonstration basée sur votre texte.</small>
    </div>
    <p style="font-style:italic;">[Texte traduit simulé] : ${cleanText}...</p>`;
    return new Observable(subscriber => {
      setTimeout(() => {
        subscriber.next(translatedMock);
        subscriber.complete();
      }, 1500);
    });
  }

  generateAiRecap(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/${id}/claude-summary`, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Erreur IA Claude:', error);
        return of('<div style="color:red;">Erreur de communication avec l\'IA Claude. Vérifiez si la clé API est configurée côté backend.</div>');
      })
    );
  }

  generatePdfSummary(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/${id}/pdf-summary`, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Erreur PDF Summary:', error);
        return of('<div style="color:red;">Erreur lors de la génération du résumé PDF. Le fichier PDF est peut-être introuvable ou illisible.</div>');
      })
    );
  }

  togglePin(pressItemId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${pressItemId}/pin?userId=${userId}`, {});
  }

  fetchMetadata(url: string): Observable<{ title?: string; description?: string; image?: string; videoUrl?: string; content?: string; error?: string }> {
    return this.http.get<{ title?: string; description?: string; image?: string; videoUrl?: string; content?: string; error?: string }>(
      `${this.baseUrl}/fetch-metadata`,
      { params: { url } }
    );
  }

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, formData);
  }

  // --- INTERACTIONS ---

  getInteractions(pressItemId: number, userId: number | null): Observable<any> {
    const params = userId ? `?userId=${userId}` : '';
    return this.http.get<any>(`${this.baseUrl}/${pressItemId}/interactions${params}`);
  }

  addComment(pressItemId: number, userId: number, text: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${pressItemId}/comment?userId=${userId}`, { text });
  }

  toggleReaction(pressItemId: number, userId: number, type: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${pressItemId}/react?userId=${userId}&type=${type}`, {});
  }

  toggleFavorite(pressItemId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${pressItemId}/favorite?userId=${userId}`, {});
  }
}

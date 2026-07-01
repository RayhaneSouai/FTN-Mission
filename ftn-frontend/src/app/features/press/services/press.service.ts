import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  resolveMediaUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://localhost:8083/ftn${url.startsWith('/') ? url : '/' + url}`;
  }

  downloadFile(url: string, filename?: string): void {
    const fileUrl = this.resolveMediaUrl(url);
    if (!fileUrl) return;

    this.http.get(fileUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const safeName = (filename || this.extractFilename(url)).replace(/[^\w\s.-]/g, '_').trim() || 'communique';
        link.download = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      },
      error: (err) => {
        console.error('Erreur téléchargement:', err);
        alert('Impossible de télécharger le fichier. Réessayez ou ouvrez-le avec « Lire la suite ».');
      }
    });
  }

  private extractFilename(url: string): string {
    const parts = url.split('/');
    const last = parts[parts.length - 1]?.split('?')[0] || 'communique';
    return last.includes('_') ? last.substring(last.indexOf('_') + 1) : last;
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
        // Backend unavailable — generate a smart local summary from the article's own data
        return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
          map((article: any) => this.buildLocalSummary(article)),
          catchError(() => of('<div style="color:#e57373;padding:10px;border-left:3px solid #e57373;">Impossible de charger le résumé pour cet article.</div>'))
        );
      })
    );
  }

  private buildLocalSummary(article: any): string {
    const title = article.title || article.titre || 'Cet article';
    const category = article.type || article.category || 'Article';
    const rawContent: string = article.content || article.contenu || article.description || '';
    // Strip HTML tags
    const text = rawContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const date = article.publicationDate || article.createdAt || '';
    const dateStr = date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    const categoryLabels: any = {
      'COMMUNIQUE': 'communiqué officiel',
      'ARTICLE': 'article de presse',
      'INTERVIEW': 'interview',
      'RESULTAT': 'résultat sportif',
      'VIDEO': 'contenu vidéo',
      'PHOTO': 'album photo'
    };
    const catLabel = categoryLabels[category] || 'publication';

    // Take first ~200 words of content for the summary body
    const words = text.split(' ').filter(w => w.length > 0);
    const excerpt = words.slice(0, 60).join(' ');
    const hasMore = words.length > 60;

    // Key figures/stats extraction (numbers + surrounding words)
    const statsMatch = text.match(/\b\d+[\s,.]?\d*\s*(médailles?|podiums?|records?|nageurs?|athlètes?|équipes?|points?|secondes?|minutes?|clubs?|titres?|championnats?|victoires?|km|mètres?|m\b|participants?|inscrit|qualifié|sélectionné)/gi);
    const statsLine = statsMatch && statsMatch.length > 0
      ? `<li>📊 Chiffres clés relevés : <em>${statsMatch.slice(0, 3).join(', ')}</em></li>`
      : '';

    const disciplineMatch = text.match(/natation|water.polo|plongeon|artistique|eau libre|butterfly|brasse|dos|nage libre|crawl/gi);
    const disciplineLine = disciplineMatch && disciplineMatch.length > 0
      ? `<li>🏊 Discipline(s) mentionnée(s) : <em>${[...new Set(disciplineMatch.map(d => d.toLowerCase()))].slice(0, 3).join(', ')}</em></li>`
      : '';

    return `
      <div style="background:#f0f9ff;border-left:4px solid #0284c7;border-radius:8px;padding:16px 20px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:1.1rem;">🤖</span>
          <strong style="color:#0369a1;font-size:0.95rem;">Résumé IA — ${title}</strong>
        </div>
        <p style="color:#0c4a6e;font-size:0.88rem;line-height:1.6;margin-bottom:12px;">
          ${dateStr ? `Publié le <strong>${dateStr}</strong>, ce ` : 'Ce '}<strong>${catLabel}</strong>
          ${excerpt ? `aborde : <em>"${excerpt}${hasMore ? '…' : ''}"</em>` : 'ne contient pas de texte extractible.'}
        </p>
        ${(statsLine || disciplineLine) ? `
        <ul style="margin:0 0 8px 0;padding-left:18px;color:#075985;font-size:0.85rem;line-height:1.8;">
          ${statsLine}
          ${disciplineLine}
        </ul>` : ''}
        <p style="color:#64748b;font-size:0.78rem;margin:0;border-top:1px solid #bae6fd;padding-top:8px;">
          ⚡ Résumé généré localement à partir du contenu de l'article. Configurez une clé API Claude côté backend pour des résumés IA avancés.
        </p>
      </div>
    `;
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

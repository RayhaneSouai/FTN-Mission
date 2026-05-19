import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    // Si on a un ID, on renvoie la miniature, sinon une image générique de sport/vidéo
    return videoId 
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
      : 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=500&auto=format&fit=crop'; 
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

  generateAiRecap(text: string): Observable<string> {
    return new Observable(subscriber => {
      setTimeout(() => {
        if (!text) {
          subscriber.next('<i>Aucun contenu à résumer.</i>');
          subscriber.complete();
          return;
        }
        const cleanText = text.replace(/<[^>]*>/g, '').trim();
        const sentences = cleanText.split(/[.!?]\n?/).map(s => s.trim()).filter(s => s.length > 20);
        
        let recap = `<div style="font-size: 1.1rem; margin-bottom: 10px;">🤖 <b>Récapitulatif IA Intelligent</b></div>`;
        if (sentences.length === 0) {
           recap += `<i>${cleanText}</i>`;
        } else {
           const subject = sentences[0];
           const details = sentences.slice(1).find(s => /\d+/.test(s)) || (sentences.length > 1 ? sentences[1] : "");
           const conclusion = sentences.length > 2 ? sentences[sentences.length - 1] : "";

           recap += `<div style="margin-bottom: 12px;"><b style="color: #0369a1;">🎯 Sujet Principal :</b> ${subject}.</div>`;
           if (details) {
              recap += `<div style="margin-bottom: 12px;"><b style="color: #0369a1;">📊 Détails / Faits Marquants :</b> ${details}.</div>`;
           }
           if (conclusion && conclusion !== details) {
              recap += `<div><b style="color: #0369a1;">💡 En bref :</b> ${conclusion}.</div>`;
           }
        }
        
        subscriber.next(recap);
        subscriber.complete();
      }, 1500);
    });
  }

  fetchMetadata(url: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/fetch-metadata?url=${encodeURIComponent(url)}`);
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/upload`, formData);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PressItem, PressStatus } from '../models/press-item.model';
import { PressStats } from '../models/press-stats.model';

@Injectable({
  providedIn: 'root'
})
export class PressService {
  private baseUrl = '/api/press';

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
}

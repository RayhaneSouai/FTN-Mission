import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PressItem } from '../models/press-item.model';

@Injectable({
  providedIn: 'root'
})
export class PressService {
  private baseUrl = '/api/press';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PressItem[]> {
    return this.http.get<PressItem[]>(`${this.baseUrl}/getAll`);
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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  getEmbedUrl(url: string): string {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank');
  }
}

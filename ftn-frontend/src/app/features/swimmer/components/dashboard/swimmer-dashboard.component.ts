import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';

import { PressService } from '../../../press/services/press.service';

@Component({
  selector: 'app-swimmer-dashboard',
  templateUrl: './swimmer-dashboard.component.html',
  styleUrls: ['./swimmer-dashboard.component.css']
})
export class SwimmerDashboardComponent implements OnInit {
  user: any = {};
  profile: any = null;
  progress: any = null;
  competitions: any[] = [];
  news: any[] = [];
  loading = true;
  error = false;
  selectedItem: any = null;
  showFullContent = false;

  private readonly articleImages = [
    'https://images.unsplash.com/photo-1560090947-5307abc46ffc?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200'
  ];

  private readonly coupeImages = [
    'https://plus.unsplash.com/premium_photo-1713836954462-6e6cd1eecc1c?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1754487436530-11d3140ec634?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  ];

  constructor(
    private swimmerService: SwimmerService,
    public pressService: PressService
  ) {}

  ngOnInit() {
    const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null;
    if (stored) this.user = JSON.parse(stored);
    this.loadData();
  }

  dashboardStats: any = null;

  loadData() {
    this.loading = true;
    
    // Fallback: If getProfile doesn't exist on athlete/profile, we'll use user from sessionStorage
    this.profile = this.user; 

    // We fetch the new dashboard stats API
    if (this.user && this.user.id) {
      this.swimmerService.getDashboardStats(this.user.id).subscribe({
        next: (stats) => { this.dashboardStats = stats; this.loading = false; },
        error: () => { this.loading = false; this.error = true; }
      });
    } else {
      this.loading = false;
    }

    this.swimmerService.getCompetitions().subscribe({
      next: (c) => { this.competitions = (c || []).slice(0, 3); },
      error: () => {}
    });

    this.swimmerService.getNews().subscribe({
      next: (n) => {
        this.news = (n || []).filter((i: any) => i.status === 'PUBLISHED').slice(0, 3);
      },
      error: () => {}
    });
  }

  get displayName(): string {
    if (this.profile) return `${this.profile.firstName} ${this.profile.lastName}`;
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  openArticle(item: any): void {
    this.selectedItem = item;
    this.showFullContent = false;
    document.body.style.overflow = 'hidden';

    const articleId = item?.idPressItem || item?.id;
    if (articleId) {
      item.views = (item.views || 0) + 1;
      this.pressService.incrementViews(articleId).subscribe({
        error: () => {
          item.views = Math.max(0, (item.views || 1) - 1);
        }
      });
    }
  }

  closeArticle(): void {
    this.selectedItem = null;
    this.showFullContent = false;
    document.body.style.overflow = 'auto';
  }

  getArticleImage(item: any): string {
    if (!item) return '';
    if (item.type === 'VIDEO' && item.mediaUrl) return this.pressService.getVideoThumbnail(item.mediaUrl);
    if (item.mediaUrl) return item.mediaUrl;
    const galleryImages = this.getGalleryImages(item.gallery);
    return galleryImages[0] || this.fallbackNewsImage(item);
  }

  fallbackNewsImage(item: any, index = 0): string {
    const haystack = `${item?.title || ''} ${item?.summary || ''} ${item?.content || ''}`.toLowerCase();
    if (haystack.includes('coupe') || haystack.includes('troph') || haystack.includes('finale')) {
      return this.coupeImages[index % this.coupeImages.length];
    }
    return this.articleImages[index % this.articleImages.length];
  }

  onNewsImageError(event: Event, item: any, index = 0): void {
    const img = event.target as HTMLImageElement;
    img.src = this.fallbackNewsImage(item, index);
  }

  getGalleryImages(gallery?: string): string[] {
    if (!gallery) return [];
    return gallery.split(',').map((url: string) => url.trim()).filter(Boolean);
  }

  getDocuments(documents?: string): string[] {
    if (!documents) return [];
    return documents.split(',').map((url: string) => url.trim()).filter(Boolean);
  }

  getPdfUrl(item: any): string {
    const url = item?.documents?.split(',')[0]?.trim() || item?.linkUrl || item?.mediaUrl || '';
    return url && !url.startsWith('http') ? `http://localhost:8083/ftn${url}` : url;
  }

  plainText(value?: string | null): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

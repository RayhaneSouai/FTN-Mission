import { Component, OnInit } from '@angular/core';
import { PressItem, PressType } from '../../models/press-item.model';
import { PressService } from '../../services/press.service';

@Component({
  selector: 'app-press-visitor',
  templateUrl: './press-visitor.component.html',
  styleUrls: ['./press-visitor.component.css']
})
export class PressVisitorComponent implements OnInit {
  items: PressItem[] = [];
  loading = false;

  categoryLabels: { [key: string]: string } = {
    'ARTICLE': 'Articles',
    'VIDEO': 'Vidéos',
    'PHOTO': 'Photos',
    'COMMUNIQUE': 'Communiqués',
    'COMPETITIONS': 'Compétitions',
    'RESULTS': 'Résultats',
    'OFFICIAL_COMMUNICATIONS': 'Communiqués Officiels',
    'NATIONAL_SELECTIONS': 'Sélections Nationales',
    'TRAININGS': 'Formations',
    'FEDERAL_EVENTS': 'Événements Fédéraux'
  };

  activeFilter = 'ALL';
  searchTerm = '';
  selectedItem: PressItem | null = null;
  showFullContent = false;

  currentPage = 1;
  itemsPerPage = 3;

  get pagedItems(): PressItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.getFilteredItems().slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.getFilteredItems().length / this.itemsPerPage));
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  // Interactions
  interactions: any = null;
  newCommentText = '';
  isSubmittingComment = false;

  aiRecap: string | null = null;
  generatingAiRecap = false;

  availableReactions = [
    { type: 'LIKE',    emoji: '👍', icon: 'thumb_up',                   label: 'Aimer' },
    { type: 'DISLIKE', emoji: '👎', icon: 'thumb_down',                  label: 'Pas aimer' },
    { type: 'SAD',     emoji: '😢', icon: 'sentiment_dissatisfied',      label: 'Triste' },
    { type: 'ANGRY',   emoji: '😡', icon: 'sentiment_very_dissatisfied', label: 'Mecontent' },
    { type: 'HEART',   emoji: '❤️', icon: 'favorite',                   label: 'Favori' }
  ];


  constructor(public pressService: PressService) {}

  ngOnInit(): void {
    this.loadPublishedItems();
  }

  loadPublishedItems(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        this.items = data
          .filter(item => item.status === 'PUBLISHED')
          .sort((a, b) => (b.idPressItem || 0) - (a.idPressItem || 0));
        this.loading = false;
        this.loadFavorites();
        this.loadPinned();
      },
      error: () => this.loading = false
    });
  }

  favoriteItems: PressItem[] = [];
  pinnedItems: PressItem[] = [];

  loadFavorites(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.pressService.getFavoritesByUserId(userId).subscribe({
      next: (res) => this.favoriteItems = res,
      error: (err) => console.error('Erreur chargement favoris', err)
    });
  }

  loadPinned(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.pressService.getPinsByUserId(userId).subscribe({
      next: (res) => this.pinnedItems = res,
      error: (err) => console.error('Erreur chargement epingles', err)
    });
  }

  getFilteredItems(): PressItem[] {
    let sourceItems = this.items;
    if (this.activeFilter === 'FAVORITES') {
        sourceItems = this.favoriteItems;
    } else if (this.activeFilter === 'PINNED') {
        sourceItems = this.pinnedItems;
    }
    
    let filtered = [...sourceItems];

    if (this.activeFilter !== 'ALL' && this.activeFilter !== 'FAVORITES' && this.activeFilter !== 'PINNED') {
      filtered = filtered.filter(item => item.type === this.activeFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        (item.summary && item.summary.toLowerCase().includes(term)) ||
        (item.content && item.content.toLowerCase().includes(term)) ||
        (item.discipline && item.discipline.toLowerCase().includes(term))
      );
    }
    return filtered;
  }

  onFilterChange(filter: string): void {
    this.activeFilter = filter;
    this.currentPage = 1;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  openArticle(item: PressItem): void {
    this.selectedItem = item;
    this.showFullContent = false;
    this.interactions = null;
    this.newCommentText = '';
    this.aiRecap = null;
    document.body.style.overflow = 'hidden';

    const articleId = item.idPressItem || (item as any).id;
    if (articleId) {
      item.views = (item.views || 0) + 1;
      this.pressService.incrementViews(articleId).subscribe({
        next: () => {}
      });
      this.loadInteractions();
    }
  }

  closeArticle(): void {
    this.selectedItem = null;
    this.interactions = null;
    this.showFullContent = false;
    this.aiRecap = null;
    document.body.style.overflow = 'auto';
  }

  getGalleryImages(galleryStr?: string): string[] {
    if (!galleryStr) return [];
    return galleryStr.split(',').map(u => u.trim()).filter(u => u.length > 0);
  }

  getDocumentsList(docStr?: string): string[] {
    if (!docStr) return [];
    return docStr.split(',').map(u => u.trim()).filter(u => u.length > 0);
  }

  // ─── Interactions ────────────────────────────────────

  get currentUserId(): number | null {
    return this.getCurrentUserId();
  }

  private getCurrentUserId(): number | null {
    if (typeof sessionStorage !== 'undefined') {
      try {
        const u = sessionStorage.getItem('user');
        if (u) {
          const user = JSON.parse(u);
          const userId = user.id || user.idUser || user.id_user;
          return userId || null;
        }
      } catch { return null; }
    }
    return null;
  }

  private getItemId(): number | undefined {
    if (!this.selectedItem) return undefined;
    return this.selectedItem.idPressItem || (this.selectedItem as any).id;
  }

  loadInteractions(): void {
    const itemId = this.getItemId();
    if (!itemId) return;
    const userId = this.getCurrentUserId();
    this.pressService.getInteractions(itemId, userId).subscribe({
      next: (res) => { this.interactions = res; },
      error: (err) => console.error('Interactions error', err)
    });
  }

  addComment(): void {
    const itemId = this.getItemId();
    if (!this.newCommentText.trim() || this.isSubmittingComment || !itemId) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour commenter.'); return; }
    this.isSubmittingComment = true;
    this.pressService.addComment(itemId, userId, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = '';
        this.isSubmittingComment = false;
        this.loadInteractions();
      },
      error: () => { this.isSubmittingComment = false; }
    });
  }

  toggleReaction(type: string): void {
    const itemId = this.getItemId();
    if (!itemId) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour réagir.'); return; }
    this.pressService.toggleReaction(itemId, userId, type).subscribe({
      next: () => this.loadInteractions()
    });
  }

  toggleFavorite(): void {
    const itemId = this.getItemId();
    if (!itemId) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour ajouter aux favoris.'); return; }
    this.pressService.toggleFavorite(itemId, userId).subscribe({
      next: () => {
        this.loadInteractions();
        this.loadFavorites();
      }
    });
  }

  togglePin(): void {
    const itemId = this.getItemId();
    if (!itemId) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour épingler.'); return; }
    this.pressService.togglePin(itemId, userId).subscribe({
      next: () => {
        this.loadInteractions();
      }
    });
  }

  getReactionCount(type: string): number {
    return this.interactions?.reactionCounts?.[type] || 0;
  }

  generateSummary() {
    const itemId = this.getItemId();
    if (!itemId) return;
    this.generatingAiRecap = true;
    this.aiRecap = null;

    const obs$ = this.selectedItem!.type === 'COMMUNIQUE'
      ? this.pressService.generatePdfSummary(itemId)
      : this.pressService.generateAiRecap(itemId);

    obs$.subscribe({
      next: (recap: string) => {
        this.aiRecap = recap;
        this.generatingAiRecap = false;
      },
      error: () => {
        this.generatingAiRecap = false;
      }
    });
  }

  onArticleImageError(event: Event, item: any, index: number = 0): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=500&auto=format&fit=crop';
    }
  }

  getArticleImage(item: any, index: number = 0): string {
    if (!item) return '';
    if (item.type === 'VIDEO' && item.mediaUrl) return this.pressService.getVideoThumbnail(item.mediaUrl);
    if (item.mediaUrl) return item.mediaUrl;
    if (item.gallery) {
      const imgs = this.getGalleryImages(item.gallery);
      if (imgs.length > 0) return imgs[index % imgs.length] || imgs[0];
    }
    return 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=500&auto=format&fit=crop';
  }

  getPdfUrl(): string {
    if (!this.selectedItem) return '';
    const url = this.selectedItem.documents?.split(',')[0]?.trim()
      || this.selectedItem.linkUrl
      || this.selectedItem.mediaUrl || '';
    return url.startsWith('http') ? url : `http://localhost:8083/ftn${url}`;
  }

  downloadCommunique(): void {
    if (!this.selectedItem) return;
    const url = this.getPdfUrl();
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = this.selectedItem.title || 'communique';
      link.target = '_blank';
      link.click();
      if (this.selectedItem.idPressItem) {
        this.pressService.incrementDownloads(this.selectedItem.idPressItem).subscribe();
      }
    }
  }

  getTypeLabel(item: any): string {
    return this.categoryLabels?.[item?.type] || 'Actualité';
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

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PressItem, PressType } from '../../models/press-item.model';
import { PressService } from '../../services/press.service';
import { PAGE_HERO_IMAGES } from '../../../../shared/components/page-hero/page-hero.constants';

interface CommentResponse {
  id: number;
  text: string;
  createdAt: string;
  userId: number;
  userFirstName: string;
  userLastName: string;
  pressItemId: number;
  parentCommentId?: number | null;
  replies?: CommentResponse[] | null;
}

@Component({
  selector: 'app-press-visitor',
  templateUrl: './press-visitor.component.html',
  styleUrls: ['./press-visitor.component.css']
})
export class PressVisitorComponent implements OnInit, OnDestroy {
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
    return this.listItemsExcludingHero.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.listItemsExcludingHero.length / this.itemsPerPage));
  }

  get heroArticle(): PressItem | null {
    if (this.activeFilter !== 'ALL' || this.searchTerm.trim()) {
      return null;
    }
    const items = this.getFilteredItems();
    return items.length > 0 ? items[0] : null;
  }

  get listItemsExcludingHero(): PressItem[] {
    const items = this.getFilteredItems();
    const hero = this.heroArticle;
    if (!hero) {
      return items;
    }
    const heroId = this.pressItemId(hero);
    return items.filter((item) => this.pressItemId(item) !== heroId);
  }

  get heroImageUrl(): string {
    if (this.heroArticle) {
      return this.getArticleImage(this.heroArticle, 0);
    }
    return PAGE_HERO_IMAGES.actualitesFallback;
  }

  get heroSubtitle(): string {
    if (this.heroArticle) {
      const excerpt = this.plainText(this.heroArticle.summary || this.heroArticle.content);
      if (excerpt) {
        return excerpt.length > 180 ? `${excerpt.slice(0, 180)}…` : excerpt;
      }
    }
    return 'Découvrez toute l\'actualité de la natation tunisienne, les résultats officiels, les sélections nationales et les événements de la fédération.';
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
  comments: CommentResponse[] = [];
  replyingTo: CommentResponse | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  aiRecap: string | null = null;
  generatingAiRecap = false;

  availableReactions = [
    { type: 'LIKE',    emoji: '👍', icon: 'thumb_up',                   label: 'Aimer' },
    { type: 'DISLIKE', emoji: '👎', icon: 'thumb_down',                  label: 'Pas aimer' },
    { type: 'SAD',     emoji: '😢', icon: 'sentiment_dissatisfied',      label: 'Triste' },
    { type: 'ANGRY',   emoji: '😡', icon: 'sentiment_very_dissatisfied', label: 'Mecontent' },
    { type: 'HEART',   emoji: '❤️', icon: 'favorite',                   label: 'Favori' }
  ];


  constructor(
    public pressService: PressService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPublishedItems();
  }

  ngOnDestroy(): void {
    this.stopCommentPolling();
  }

  loadPublishedItems(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        this.items = data
          .filter(item => item.status === 'PUBLISHED')
          .sort((a, b) => {
            const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
          });
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
    this.comments = [];
    this.newCommentText = '';
    this.replyingTo = null;
    this.aiRecap = null;
    document.body.style.overflow = 'hidden';

    const articleId = item.idPressItem || (item as any).id;
    if (articleId) {
      item.views = (item.views || 0) + 1;
      this.pressService.incrementViews(articleId).subscribe({
        next: () => {}
      });
      this.loadInteractions();
      this.fetchComments();
      this.startCommentPolling();
    }
  }

  closeArticle(): void {
    this.stopCommentPolling();
    this.selectedItem = null;
    this.interactions = null;
    this.comments = [];
    this.replyingTo = null;
    this.showFullContent = false;
    this.aiRecap = null;
    document.body.style.overflow = 'auto';
  }

  private startCommentPolling(): void {
    this.stopCommentPolling();
    this.pollingInterval = setInterval(() => this.fetchComments(), 2000);
  }

  private stopCommentPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  fetchComments(): void {
    const articleId = this.getItemId();
    if (!articleId) return;
    this.http.get<CommentResponse[]>(`http://localhost:8083/ftn/api/press-comments/${articleId}`).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur fetch comments:', err)
    });
  }

  postComment(): void {
    const itemId = this.getItemId();
    if (!this.newCommentText.trim() || !itemId) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour commenter.'); return; }

    const payload = {
      pressItemId: itemId,
      text: this.newCommentText,
      userId,
      parentCommentId: this.replyingTo ? this.replyingTo.id : null
    };

    this.isSubmittingComment = true;
    this.http.post<CommentResponse>('http://localhost:8083/ftn/api/press-comments', payload).subscribe({
      next: (saved) => {
        this.newCommentText = '';
        this.replyingTo = null;
        this.isSubmittingComment = false;
        if (saved.parentCommentId) {
          this.fetchComments();
        } else {
          this.comments = [...this.comments, saved];
        }
        this.cdr.detectChanges();
      },
      error: () => { this.isSubmittingComment = false; }
    });
  }

  replyTo(comment: CommentResponse): void {
    this.replyingTo = comment;
  }

  cancelReply(): void {
    this.replyingTo = null;
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
    this.postComment();
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
    const wasFavorited = !!this.interactions?.isFavoritedByCurrentUser;
    this.updateFavoriteList(itemId, !wasFavorited);
    this.updateInteractionFlags({ isFavoritedByCurrentUser: !wasFavorited, totalFavorites: wasFavorited ? -1 : 1 });
    this.pressService.toggleFavorite(itemId, userId).subscribe({
      next: () => {
        this.loadInteractions();
      },
      error: () => {
        this.updateFavoriteList(itemId, wasFavorited);
        this.updateInteractionFlags({ isFavoritedByCurrentUser: wasFavorited, totalFavorites: wasFavorited ? 1 : -1 });
      }
    });
  }

  togglePin(): void {
    const itemId = this.getItemId();
    if (!itemId) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour épingler.'); return; }
    const wasPinned = !!this.interactions?.isPinnedByCurrentUser;
    this.updatePinnedList(itemId, !wasPinned);
    this.updateInteractionFlags({ isPinnedByCurrentUser: !wasPinned, totalPins: wasPinned ? -1 : 1 });
    this.pressService.togglePin(itemId, userId).subscribe({
      next: () => {
        this.loadInteractions();
      },
      error: () => {
        this.updatePinnedList(itemId, wasPinned);
        this.updateInteractionFlags({ isPinnedByCurrentUser: wasPinned, totalPins: wasPinned ? 1 : -1 });
      }
    });
  }

  private updatePinnedList(itemId: number, shouldPin: boolean): void {
    const item = this.selectedItem || this.items.find(candidate => this.pressItemId(candidate) === itemId);
    const exists = this.pinnedItems.some(candidate => this.pressItemId(candidate) === itemId);
    if (shouldPin && item && !exists) {
      this.pinnedItems = [item, ...this.pinnedItems];
      return;
    }
    if (!shouldPin) {
      this.pinnedItems = this.pinnedItems.filter(candidate => this.pressItemId(candidate) !== itemId);
      if (this.activeFilter === 'PINNED' && this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    }
  }

  private updateFavoriteList(itemId: number, shouldFavorite: boolean): void {
    const item = this.selectedItem || this.items.find(candidate => this.pressItemId(candidate) === itemId);
    const exists = this.favoriteItems.some(candidate => this.pressItemId(candidate) === itemId);
    if (shouldFavorite && item && !exists) {
      this.favoriteItems = [item, ...this.favoriteItems];
      return;
    }
    if (!shouldFavorite) {
      this.favoriteItems = this.favoriteItems.filter(candidate => this.pressItemId(candidate) !== itemId);
      if (this.activeFilter === 'FAVORITES' && this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    }
  }

  private updateInteractionFlags(flags: {
    isPinnedByCurrentUser?: boolean;
    isFavoritedByCurrentUser?: boolean;
    totalPins?: number;
    totalFavorites?: number;
  }): void {
    if (!this.interactions) return;
    this.interactions = {
      ...this.interactions,
      ...('isPinnedByCurrentUser' in flags ? { isPinnedByCurrentUser: flags.isPinnedByCurrentUser } : {}),
      ...('isFavoritedByCurrentUser' in flags ? { isFavoritedByCurrentUser: flags.isFavoritedByCurrentUser } : {}),
      totalPins: Math.max(0, (this.interactions.totalPins || 0) + (flags.totalPins || 0)),
      totalFavorites: Math.max(0, (this.interactions.totalFavorites || 0) + (flags.totalFavorites || 0))
    };
  }

  private pressItemId(item: any): number | undefined {
    return item?.idPressItem || item?.id;
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
    return this.pressService.resolveMediaUrl(url);
  }

  downloadCommunique(): void {
    if (!this.selectedItem) return;
    const rawUrl = this.selectedItem.documents?.split(',')[0]?.trim()
      || this.selectedItem.linkUrl
      || this.selectedItem.mediaUrl || '';
    if (!rawUrl) return;

    const filename = `${this.selectedItem.title || 'communique'}.pdf`;
    this.pressService.downloadFile(rawUrl, filename);

    if (this.selectedItem.idPressItem) {
      this.pressService.incrementDownloads(this.selectedItem.idPressItem).subscribe();
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

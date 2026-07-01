import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwimmerService } from '../../services/swimmer.service';
import { PressService } from '../../../press/services/press.service';

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
  selector: 'app-swimmer-actualites',
  templateUrl: './swimmer-actualites.component.html',
  styleUrls: ['./swimmer-actualites.component.css']
})
export class SwimmerActualitesComponent implements OnInit {
  news: any[] = [];
  loading = true;
  selectedDiscipline = '';
  activeFilter = 'ALL';
  disciplines: string[] = ['Natation', 'Water-Polo', 'Plongeon', 'Natation Artistique', 'Eau Libre'];

  favoriteIds: Set<number> = new Set<number>();
  pinnedIds: Set<number> = new Set<number>();

  get filteredItems(): any[] {
    let result = this.news;
    if (this.selectedDiscipline) {
      result = result.filter(i => i.discipline === this.selectedDiscipline);
    }
    if (this.activeFilter === 'FAVORITES') {
      result = result.filter(i => this.favoriteIds.has(i.idPressItem || i.id));
    } else if (this.activeFilter === 'PINNED') {
      result = result.filter(i => this.pinnedIds.has(i.idPressItem || i.id));
    }
    return result;
  }

  currentPage = 1;
  itemsPerPage = 3;

  get pagedItems(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.itemsPerPage));
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

  selectedItem: any = null;
  showFullContent = false;

  categoryLabels: any = {
    'COMMUNIQUE': 'Communiqué',
    'ARTICLE': 'Article de Presse',
    'INTERVIEW': 'Interview',
    'RESULTAT': 'Résultat',
    'VIDEO': 'Vidéo',
    'PHOTO': 'Album Photo'
  };

  interactions: any = null;
  isSubmittingComment = false;
  newCommentText: string = '';
  comments: any[] = [];
  replyingTo: any = null;
  pollingInterval: any = null;

  aiRecap: string | null = null;
  generatingAiRecap = false;

  availableReactions = [
    { type: 'LIKE', emoji: '👍' },
    { type: 'DISLIKE', emoji: '👎' },
    { type: 'SAD', emoji: '😢' },
    { type: 'ANGRY', emoji: '😡' },
    { type: 'HEART', emoji: '❤️' }
  ];

  constructor(
    private svc: SwimmerService,
    public pressService: PressService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.svc.getNews().subscribe({
      next: (n) => {
        this.news = (n || []).filter((i: any) => i.status === 'PUBLISHED');
        this.loading = false;
        this.loadPinnedItems();
        this.loadFavoriteItems();
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadPinnedItems() {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.pressService.getPinsByUserId(userId).subscribe({
      next: (pins) => {
        this.pinnedIds = new Set(pins.map(p => p.idPressItem).filter((id): id is number => id !== undefined));
      },
      error: (err: any) => console.error('Erreur chargement épingles', err)
    });
  }

  loadFavoriteItems() {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.pressService.getFavoritesByUserId(userId).subscribe({
      next: (favs) => {
        this.favoriteIds = new Set(favs.map(f => f.idPressItem).filter((id): id is number => id !== undefined));
      },
      error: (err: any) => console.error('Erreur chargement favoris', err)
    });
  }

  onFilterChange(filter: string) {
    this.activeFilter = filter;
    this.currentPage = 1;
  }

  filterByDiscipline(disc: string) {
    this.selectedDiscipline = disc;
    this.currentPage = 1;
  }

  openArticle(item: any) {
    this.selectedItem = item;
    this.showFullContent = false;
    this.aiRecap = null;
    this.comments = [];
    document.body.style.overflow = 'hidden';
    this.loadInteractions();
    this.fetchComments();
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(() => this.fetchComments(), 2000);

    const articleId = item.idPressItem || item.id;
    if (articleId) {
      item.views = (item.views || 0) + 1;
      
      this.pressService.incrementViews(articleId).subscribe({
        next: () => {},
        error: err => console.error('Erreur incrementation vues:', err)
      });
    }
  }

  closeArticle() {
    this.selectedItem = null;
    this.interactions = null;
    this.aiRecap = null;
    this.replyingTo = null;
    document.body.style.overflow = 'auto';
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  getGalleryImages(galleryStr: string): string[] {
    if (!galleryStr) return [];
    return galleryStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getDocumentsList(docsStr: string): string[] {
    if (!docsStr) return [];
    return docsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getDocuments(docsStr: string): string[] {
    return this.getDocumentsList(docsStr);
  }

  getFileName(url: string): string {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Document';
    } catch {
      return 'Document';
    }
  }

  downloadDocument(item: any, url: string) {
    this.pressService.incrementDownloads(item.idPressItem).subscribe();
    window.open(url, '_blank');
  }

  openLink(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }

  get currentUserId(): number | null {
    return this.getCurrentUserId();
  }

  private getCurrentUserId(): number | null {
    if (typeof sessionStorage !== 'undefined') {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.id || user.idUser || user.id_user;
          if (!userId) console.warn('User found in sessionStorage but no ID field:', user);
          return userId || null;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  private getItemId(): number | undefined {
    if (!this.selectedItem) return undefined;
    return this.selectedItem.idPressItem || this.selectedItem.id;
  }

  loadInteractions() {
    if (!this.selectedItem) return;
    const itemId = this.getItemId();
    if (!itemId) return;
    const userId = this.getCurrentUserId();
    this.pressService.getInteractions(itemId, userId).subscribe({
      next: (res) => {
        this.interactions = res;
      },
      error: (err: any) => console.error('Error loading interactions', err)
    });
  }

  addComment() {
    if (!this.newCommentText.trim() || this.isSubmittingComment || !this.selectedItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const itemId = this.getItemId();
    if (!itemId) return;

    this.isSubmittingComment = true;
    this.pressService.addComment(itemId, userId, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = '';
        this.isSubmittingComment = false;
        this.loadInteractions();
      },
      error: (err: any) => {
        console.error('Error adding comment', err);
        this.isSubmittingComment = false;
      }
    });
  }

  toggleReaction(type: string) {
    if (!this.selectedItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const itemId = this.getItemId();
    if (!itemId) return;

    this.pressService.toggleReaction(itemId, userId, type).subscribe({
      next: () => {
        this.loadInteractions();
      },
      error: (err: any) => console.error('Error toggling reaction', err)
    });
  }

  toggleFavorite() {
    if (!this.selectedItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const itemId = this.getItemId();
    if (!itemId) return;

    this.pressService.toggleFavorite(itemId, userId).subscribe({
      next: () => {
        this.loadInteractions();
      },
      error: (err: any) => console.error('Error toggling favorite', err)
    });
  }

  togglePin() {
    if (!this.selectedItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const itemId = this.getItemId();
    if (!itemId) return;

    this.pressService.togglePin(itemId, userId).subscribe({
      next: () => {
        this.loadInteractions();
        if (this.pinnedIds.has(itemId)) {
          this.pinnedIds.delete(itemId);
        } else {
          this.pinnedIds.add(itemId);
        }
      },
      error: (err: any) => console.error('Error toggling pin', err)
    });
  }

  getReactionCount(type: string): number {
    if (!this.interactions || !this.interactions.reactionCounts) return 0;
    return this.interactions.reactionCounts[type] || 0;
  }

  generateSummary() {
    if (!this.selectedItem) return;
    this.generatingAiRecap = true;
    this.aiRecap = null;

    const id = this.getItemId();
    if (!id) { this.generatingAiRecap = false; return; }

    const obs$ = this.selectedItem.type === 'COMMUNIQUE'
      ? this.pressService.generatePdfSummary(id)
      : this.pressService.generateAiRecap(id);

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
  // --- Real-time Comments (Long Polling) ---

  fetchComments() {
    if (!this.selectedItem) return;
    const articleId = this.selectedItem.idPressItem || this.selectedItem.id;
    if (!articleId) return;
    this.http.get<any[]>(`http://localhost:8083/ftn/api/press-comments/${articleId}`).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur fetch comments:', err)
    });
  }

  postComment() {
    if (!this.newCommentText.trim() || !this.selectedItem) return;
    const articleId = this.selectedItem.idPressItem || this.selectedItem.id;
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const payload = {
      pressItemId: articleId,
      text: this.newCommentText,
      userId: userId,
      parentCommentId: this.replyingTo ? this.replyingTo.id : null
    };

    this.http.post<CommentResponse>('http://localhost:8083/ftn/api/press-comments', payload).subscribe({
      next: (saved) => {
        this.newCommentText = '';
        this.replyingTo = null;
        if (saved.parentCommentId) {
          this.fetchComments();
        } else {
          this.comments = [...this.comments, saved];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur post comment:', err)
    });
  }

  replyTo(comment: any) {
    this.replyingTo = comment;
  }

  cancelReply() {
    this.replyingTo = null;
  }
}

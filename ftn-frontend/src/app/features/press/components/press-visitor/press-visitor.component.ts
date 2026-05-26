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
    { type: 'LIKE',    emoji: '👍' },
    { type: 'DISLIKE', emoji: '👎' },
    { type: 'SAD',     emoji: '😢' },
    { type: 'ANGRY',   emoji: '😡' },
    { type: 'HEART',   emoji: '❤️' }
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
    if (typeof localStorage !== 'undefined') {
      try {
        const u = localStorage.getItem('user');
        if (u) {
          const user = JSON.parse(u);
          const userId = user.id || user.idUser || user.id_user;
          return userId || null;
        }
      } catch { return null; }
    }
    return null;
  }

  loadInteractions(): void {
    if (!this.selectedItem?.idPressItem) return;
    const userId = this.getCurrentUserId();
    this.pressService.getInteractions(this.selectedItem.idPressItem, userId).subscribe({
      next: (res) => { this.interactions = res; },
      error: (err) => console.error('Interactions error', err)
    });
  }

  addComment(): void {
    if (!this.newCommentText.trim() || this.isSubmittingComment || !this.selectedItem?.idPressItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour commenter.'); return; }
    this.isSubmittingComment = true;
    this.pressService.addComment(this.selectedItem.idPressItem, userId, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = '';
        this.isSubmittingComment = false;
        this.loadInteractions();
      },
      error: () => { this.isSubmittingComment = false; }
    });
  }

  toggleReaction(type: string): void {
    if (!this.selectedItem?.idPressItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour réagir.'); return; }
    this.pressService.toggleReaction(this.selectedItem.idPressItem, userId, type).subscribe({
      next: () => this.loadInteractions()
    });
  }

  toggleFavorite(): void {
    if (!this.selectedItem?.idPressItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour ajouter aux favoris.'); return; }
    this.pressService.toggleFavorite(this.selectedItem.idPressItem, userId).subscribe({
      next: () => {
        this.loadInteractions();
        this.loadFavorites(); // Reload favorites list in background
      }
    });
  }

  togglePin(): void {
    if (!this.selectedItem?.idPressItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) { alert('Vous devez être connecté pour épingler.'); return; }
    this.pressService.togglePin(this.selectedItem.idPressItem, userId).subscribe({
      next: () => {
        this.loadInteractions();
      }
    });
  }

  getReactionCount(type: string): number {
    return this.interactions?.reactionCounts?.[type] || 0;
  }

  generateSummary() {
    if (!this.selectedItem?.idPressItem) return;
    this.generatingAiRecap = true;
    
    this.pressService.generateAiRecap(this.selectedItem.idPressItem).subscribe({
      next: (recap) => {
        this.aiRecap = recap;
        this.generatingAiRecap = false;
      },
      error: () => {
        this.generatingAiRecap = false;
      }
    });
  }
}

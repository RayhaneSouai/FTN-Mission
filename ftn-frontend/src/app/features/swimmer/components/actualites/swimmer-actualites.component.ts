import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';
import { PressService } from '../../../press/services/press.service';

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
  newCommentText: string = '';
  isSubmittingComment = false;

  aiRecap: string | null = null;
  generatingAiRecap = false;

  availableReactions = [
    { type: 'LIKE', emoji: '👍' },
    { type: 'DISLIKE', emoji: '👎' },
    { type: 'SAD', emoji: '😢' },
    { type: 'ANGRY', emoji: '😡' },
    { type: 'HEART', emoji: '❤️' }
  ];

  constructor(private svc: SwimmerService, public pressService: PressService) {}

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
    document.body.style.overflow = 'hidden';
    this.loadInteractions();

    const articleId = item.idPressItem || item.id;
    if (articleId) {
      // Increment optimisticly
      item.views = (item.views || 0) + 1;
      
      this.pressService.incrementViews(articleId).subscribe({
        next: () => {
          // already incremented
        },
        error: err => console.error('Erreur incrementation vues:', err)
      });
    }
  }

  closeArticle() {
    this.selectedItem = null;
    this.interactions = null;
    this.aiRecap = null;
    document.body.style.overflow = 'auto';
  }



  getGalleryImages(galleryStr: string): string[] {
    if (!galleryStr) return [];
    return galleryStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  getDocumentsList(docsStr: string): string[] {
    if (!docsStr) return [];
    return docsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  // Alias used in the template
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

  // --- INTERACTIONS METHODS ---

  get currentUserId(): number | null {
    return this.getCurrentUserId();
  }

  private getCurrentUserId(): number | null {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.id || user.idUser || user.id_user;
          if (!userId) console.warn('User found in localStorage but no ID field:', user);
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
}

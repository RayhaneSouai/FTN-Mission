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

  // Interactions
  interactions: any = null;
  newCommentText = '';
  isSubmittingComment = false;

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
      },
      error: () => this.loading = false
    });
  }

  getFilteredItems(): PressItem[] {
    let filtered = [...this.items];
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
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  openArticle(item: PressItem): void {
    this.selectedItem = item;
    this.showFullContent = false;
    this.interactions = null;
    this.newCommentText = '';
    document.body.style.overflow = 'hidden';

    if (item.idPressItem) {
      this.pressService.incrementViews(item.idPressItem).subscribe({
        next: () => {
          if (this.selectedItem) this.selectedItem.views = (this.selectedItem.views || 0) + 1;
          const local = this.items.find(i => i.idPressItem === item.idPressItem);
          if (local) local.views = (local.views || 0) + 1;
        }
      });
      this.loadInteractions();
    }
  }

  closeArticle(): void {
    this.selectedItem = null;
    this.interactions = null;
    this.showFullContent = false;
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

  private getCurrentUserId(): number | null {
    if (typeof localStorage !== 'undefined') {
      try {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u).id : null;
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
      next: () => this.loadInteractions()
    });
  }

  getReactionCount(type: string): number {
    return this.interactions?.reactionCounts?.[type] || 0;
  }
}

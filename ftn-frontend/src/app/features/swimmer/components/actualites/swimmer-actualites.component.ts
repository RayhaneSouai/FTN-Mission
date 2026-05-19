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
  disciplines: string[] = ['Natation', 'Water-Polo', 'Plongeon', 'Natation Artistique', 'Eau Libre'];

  get filteredItems(): any[] {
    if (!this.selectedDiscipline) return this.news;
    return this.news.filter(i => i.discipline === this.selectedDiscipline);
  }

  selectedItem: any = null;
  translatedContent: string | null = null;
  aiRecap: string | null = null;
  isTranslating = false;
  isRecapping = false;
  targetLang = 'fr'; // default translation target
  showIframe = false;
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
      },
      error: () => { this.loading = false; }
    });
  }

  filterByDiscipline(disc: string) {
    this.selectedDiscipline = disc;
  }

  openArticle(item: any) {
    this.selectedItem = item;
    this.translatedContent = null;
    this.aiRecap = null;
    this.showIframe = false;
    this.showFullContent = false;
    document.body.style.overflow = 'hidden';
    this.loadInteractions();
  }

  closeArticle() {
    this.selectedItem = null;
    this.translatedContent = null;
    this.aiRecap = null;
    this.interactions = null;
    document.body.style.overflow = 'auto';
  }

  generateRecap() {
    if (!this.selectedItem) return;
    this.isRecapping = true;
    const textToRecap = this.selectedItem.content || this.selectedItem.summary || this.selectedItem.title;
    this.pressService.generateAiRecap(textToRecap).subscribe({
      next: (res) => {
        this.aiRecap = res;
        this.isRecapping = false;
      },
      error: () => this.isRecapping = false
    });
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

  private getCurrentUserId(): number | null {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  loadInteractions() {
    if (!this.selectedItem) return;
    const userId = this.getCurrentUserId();
    this.pressService.getInteractions(this.selectedItem.idPressItem, userId).subscribe({
      next: (res) => {
        this.interactions = res;
      },
      error: (err) => console.error('Error loading interactions', err)
    });
  }

  addComment() {
    if (!this.newCommentText.trim() || this.isSubmittingComment || !this.selectedItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.isSubmittingComment = true;
    this.pressService.addComment(this.selectedItem.idPressItem, userId, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = '';
        this.isSubmittingComment = false;
        this.loadInteractions(); // Reload to see the new comment
      },
      error: (err) => {
        console.error('Error adding comment', err);
        this.isSubmittingComment = false;
      }
    });
  }

  toggleReaction(type: string) {
    if (!this.selectedItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.pressService.toggleReaction(this.selectedItem.idPressItem, userId, type).subscribe({
      next: () => {
        this.loadInteractions(); // Reload to see updated reactions
      },
      error: (err) => console.error('Error toggling reaction', err)
    });
  }

  toggleFavorite() {
    if (!this.selectedItem) return;
    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.pressService.toggleFavorite(this.selectedItem.idPressItem, userId).subscribe({
      next: () => {
        this.loadInteractions(); // Reload to see updated favorite status
      },
      error: (err) => console.error('Error toggling favorite', err)
    });
  }

  getReactionCount(type: string): number {
    if (!this.interactions || !this.interactions.reactionCounts) return 0;
    return this.interactions.reactionCounts[type] || 0;
  }
}

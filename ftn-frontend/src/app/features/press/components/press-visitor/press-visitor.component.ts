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
  
  types: PressType[] = [
    'ARTICLE', 'VIDEO', 'PHOTO', 'COMMUNIQUE',
    'COMPETITIONS', 'RESULTS', 'OFFICIAL_COMMUNICATIONS', 'NATIONAL_SELECTIONS', 'TRAININGS', 'FEDERAL_EVENTS'
  ];

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
  translatedContent: string | null = null;
  aiRecap: string | null = null;
  isTranslating = false;
  isRecapping = false;
  targetLang = 'fr';
  showIframe = false;

  constructor(public pressService: PressService) {}

  ngOnInit(): void {
    this.loadPublishedItems();
  }

  loadPublishedItems(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        // Only show PUBLISHED items
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

    // Filter by Type/Category
    if (this.activeFilter !== 'ALL') {
      filtered = filtered.filter(item => item.type === this.activeFilter);
    }

    // Search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        (item.summary && item.summary.toLowerCase().includes(term)) ||
        item.content.toLowerCase().includes(term) ||
        item.discipline.toLowerCase().includes(term)
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
    this.translatedContent = null;
    this.aiRecap = null;
    this.showIframe = false;
    // Increment view count via service
    if (item.idPressItem) {
      this.pressService.incrementViews(item.idPressItem).subscribe({
        next: () => {
          // Increment locally for instant UI update
          if (this.selectedItem) {
            this.selectedItem.views = (this.selectedItem.views || 0) + 1;
          }
          const localItem = this.items.find(i => i.idPressItem === item.idPressItem);
          if (localItem) {
            localItem.views = (localItem.views || 0) + 1;
          }
        }
      });
    }
  }

  closeArticle(): void {
    this.selectedItem = null;
    this.translatedContent = null;
    this.aiRecap = null;
    this.showIframe = false;
    this.showFullContent = false;
  }

  translateArticle(): void {
    if (!this.selectedItem) return;
    this.isTranslating = true;
    const textToTranslate = this.selectedItem.content || this.selectedItem.summary || this.selectedItem.title;
    this.pressService.translateText(textToTranslate, this.targetLang).subscribe({
      next: (res) => {
        this.translatedContent = res;
        this.isTranslating = false;
      },
      error: () => this.isTranslating = false
    });
  }

  generateRecap(): void {
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

  downloadDocument(item: PressItem, docUrl: string): void {
    if (item.idPressItem) {
      this.pressService.incrementDownloads(item.idPressItem).subscribe({
        next: () => {
          // Increment locally
          item.downloadsCount = (item.downloadsCount || 0) + 1;
          if (this.selectedItem && this.selectedItem.idPressItem === item.idPressItem) {
            this.selectedItem.downloadsCount = (this.selectedItem.downloadsCount || 0) + 1;
          }
        }
      });
    }
    window.open(docUrl, '_blank');
  }

  getGalleryImages(galleryStr?: string): string[] {
    if (!galleryStr) return [];
    return galleryStr
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  }

  getDocumentsList(docStr?: string): string[] {
    if (!docStr) return [];
    return docStr
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  }

  getFileName(url: string): string {
    try {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      return decodeURIComponent(fileName.split('?')[0]);
    } catch {
      return 'document.pdf';
    }
  }
}

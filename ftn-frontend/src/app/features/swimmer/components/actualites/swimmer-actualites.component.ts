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
  }

  closeArticle() {
    this.selectedItem = null;
    this.translatedContent = null;
    this.aiRecap = null;
    document.body.style.overflow = 'auto';
  }

  translateArticle() {
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
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PressItem, PressType } from '../../models/press-item.model';
import { PressStats } from '../../models/press-stats.model';
import { PressService } from '../../services/press.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-press-list',
  templateUrl: './press-list.component.html',
  styleUrls: ['./press-list.component.css']
})
export class PressListComponent implements OnInit {
  items: PressItem[] = [];
  filterType: string = 'ALL';
  filterStatus: string = 'ALL';
  loading = false;
  searchTerm: string = '';
  
  // Stats Simplifiées (Legacy)
  stats = { total: 0, published: 0, draft: 0, archived: 0, deleted: 0 };
  
  // Stats Riches (Backend)
  richStats: PressStats | null = null;
  
  message = '';
  messageType: 'success' | 'error' = 'success';
  types: PressType[] = [
    'ARTICLE', 'VIDEO', 'PHOTO', 'COMMUNIQUE'
  ];
  categoryLabels: { [key: string]: string } = {
    'ARTICLE': 'Article',
    'VIDEO': 'Vidéo',
    'PHOTO': 'Photos',
    'COMMUNIQUE': 'Communiqué',
    'COMPETITIONS': 'Compétitions',
    'RESULTS': 'Résultats',
    'OFFICIAL_COMMUNICATIONS': 'Communiqués Officiels',
    'NATIONAL_SELECTIONS': 'Sélections Nationales',
    'TRAININGS': 'Formations',
    'FEDERAL_EVENTS': 'Événements Fédéraux'
  };
  disciplines: string[] = ['Natation', 'Water-Polo', 'Plongeon', 'Natation Artistique', 'Eau Libre', 'Général'];

  // Modal Form State
  showForm = false;
  creationMode: string = 'CHOICE';
  editingItem = false;
  submitting = false;
  formData: PressItem = this.getEmptyItem();

  // Article View Modal State
  selectedItem: any = null;
  translatedContent: string | null = null;
  aiRecap: string | null = null;
  isTranslating = false;
  isRecapping = false;
  targetLang = 'fr';
  showIframe = false;
  showFullContent = false;

  constructor(
    public pressService: PressService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadStats();
  }

  loadAll(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        console.log(`Données chargées : ${this.items.length} éléments. Statuts reçus du serveur :`, this.items.map(i => i.status));
        this.calculateLegacyStats();
        this.loadStats();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.pressService.getStats().subscribe({
      next: (data) => {
        this.richStats = data;
      }
    });
  }

  calculateLegacyStats(): void {
    this.stats.total = this.items.length;
    this.stats.published = this.items.filter(i => i.status === 'PUBLISHED').length;
    this.stats.draft = this.items.filter(i => i.status === 'DRAFT').length;
    this.stats.archived = this.items.filter(i => i.status === 'ARCHIVED').length;
    this.stats.deleted = this.items.filter(i => i.status === 'DELETED').length;
  }

  getPercentage(value: number, total: number): string {
    if (!total) return '0%';
    return Math.round((value / total) * 100) + '%';
  }

  getMapKeys(map?: { [key: string]: number }): string[] {
    return map ? Object.keys(map) : [];
  }

  getFilteredItems(): PressItem[] {
    let filtered = [...this.items];

    // Filter by Type
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(i => i.type === this.filterType);
    }

    // Filter by Status
    if (this.filterStatus !== 'ALL') {
      console.log(`Filtrage par statut: ${this.filterStatus}. Items disponibles:`, this.items.map(i => i.status));
      filtered = filtered.filter(i => i.status?.toString().toUpperCase() === this.filterStatus.toUpperCase());
    } else {
      // By default, don't show deleted items unless specifically filtered
      filtered = filtered.filter(i => i.status?.toString().toUpperCase() !== 'DELETED');
    }

    // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(term) || 
        i.content.toLowerCase().includes(term) ||
        i.discipline.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onFilterChange(type: string): void {
    this.filterType = type;
  }

  onStatusFilterChange(status: string): void {
    console.log('Changement de filtre statut vers:', status);
    this.filterStatus = status;
  }

  goToAdd(): void { 
    this.openAddForm();
  }
  
  goToEdit(id: number): void { 
    const item = this.items.find(i => i.idPressItem === id);
    if (item) this.openEditForm(item);
  }

  // --- Modal Form Logic ---

  getEmptyItem(): PressItem {
    return {
      title: '',
      content: '',
      mediaUrl: '',
      discipline: 'Général',
      type: 'ARTICLE',
      summary: '',
      author: 'Admin',
      importance: 'NORMAL',
      scheduledAt: '',
      gallery: '',
      documents: '',
      views: 0,
      downloadsCount: 0,
      readTime: 1
    };
  }

  openAddForm(): void {
    this.editingItem = false;
    this.formData = this.getEmptyItem();
    this.creationMode = 'CHOICE';
    this.showForm = true;
  }

  setCreationMode(mode: string): void {
    this.creationMode = mode;
  }

  openEditForm(item: PressItem): void {
    this.editingItem = true;
    this.formData = { ...item };
    // Formater la date pour l'input datetime-local
    if (this.formData.scheduledAt) {
      try {
        const date = new Date(this.formData.scheduledAt);
        const pad = (n: number) => n.toString().padStart(2, '0');
        this.formData.scheduledAt = date.getFullYear() + '-' +
          pad(date.getMonth() + 1) + '-' +
          pad(date.getDate()) + 'T' +
          pad(date.getHours()) + ':' +
          pad(date.getMinutes());
      } catch (e) {
        console.error(e);
      }
    }
    this.creationMode = 'MANUAL'; // Editing always goes to manual mode
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  // --- Article View Modal Logic ---
  openArticle(item: any): void {
    this.selectedItem = item;
    this.translatedContent = null;
    this.aiRecap = null;
    this.showIframe = false;
    this.showFullContent = false;
    document.body.style.overflow = 'hidden';
  }

  closeArticle(): void {
    this.selectedItem = null;
    this.translatedContent = null;
    this.aiRecap = null;
    document.body.style.overflow = 'auto';
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

  downloadDocument(item: any, url: string): void {
    this.pressService.incrementDownloads(item.idPressItem).subscribe();
    window.open(url, '_blank');
  }

  openLink(url: string | undefined): void {
    if (url) window.open(url, '_blank');
  }

  saveItem(): void {
    const isWritingType = this.formData.type === 'ARTICLE' || this.formData.type === 'COMMUNIQUE';
    
    if (!this.formData.title || !this.formData.discipline || (isWritingType && !this.formData.content)) {
      this.showMessage('Veuillez remplir tous les champs obligatoires (Titre, Discipline' + (isWritingType ? ', Contenu' : '') + ').', 'error');
      return;
    }
    this.submitting = true;

    // Calcul automatique du temps de lecture
    const text = (this.formData.content || '').replace(/<[^>]*>/g, '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    this.formData.readTime = Math.max(1, Math.ceil(words / 200));

    // Détermination automatique du statut en fonction de scheduledAt
    if (this.formData.scheduledAt) {
      this.formData.status = 'SCHEDULED';
    } else if (!this.formData.status || this.formData.status === 'DELETED') {
      this.formData.status = 'DRAFT';
    }

    const payload = { ...this.formData };
    if (!payload.scheduledAt) {
      delete payload.scheduledAt;
    }

    const action$ = this.editingItem 
      ? this.pressService.update(payload.idPressItem!, payload)
      : this.pressService.add(payload);

    action$.subscribe({
      next: () => {
        this.submitting = false;
        this.showForm = false;
        this.loadAll();
        this.showMessage(this.editingItem ? '✅ Article mis à jour' : '✅ Article enregistré', 'success');
      },
      error: () => {
        this.submitting = false;
        this.showMessage('❌ Erreur lors de l\'enregistrement', 'error');
      }
    });
  }

  // --- WYSIWYG Editor Commands ---
  execEditorCommand(command: string, value: string = ''): void {
    document.execCommand(command, false, value);
  }

  insertTable(): void {
    const rows = prompt('Nombre de lignes :', '3');
    const cols = prompt('Nombre de colonnes :', '3');
    if (!rows || !cols) return;
    
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">';
    for (let r = 0; r < +rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < +cols; c++) {
        tableHtml += '<td style="border: 1px solid #cbd5e0; padding: 8px; text-align: left; background-color: #ffffff; color: #1e293b;">Cellule</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    
    document.execCommand('insertHTML', false, tableHtml);
  }

  insertLink(): void {
    const url = prompt('URL du lien :', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  }

  onEditorInput(event: any): void {
    this.formData.content = event.target.innerHTML;
  }

  fetchFromUrl(): void {
    if (!this.formData.linkUrl) {
      this.showMessage('Veuillez entrer un lien valide.', 'error');
      return;
    }

    this.loading = true;
    this.pressService.fetchMetadata(this.formData.linkUrl).subscribe({
      next: (data) => {
        if (data.error) {
          this.showMessage(data.error, 'error');
        } else {
          this.formData.title = data.title || '';
          if (data.videoUrl) {
            this.formData.type = 'VIDEO';
            this.formData.mediaUrl = data.videoUrl;
          } else if (data.image) {
            this.formData.mediaUrl = data.image;
          }
          const rawContent = data.content || '';
          if (rawContent) {
            this.formData.content = rawContent;
          }
          this.showMessage('✨ Données extraites !', 'success');
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Fetch metadata error:', err);
        const errMsg = err.message || err.statusText || 'Erreur inconnue';
        this.showMessage(`❌ Erreur: ${errMsg}`, 'error');
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.loading = true;
      this.pressService.uploadFile(file).subscribe({
        next: (res) => {
          // Si le backend renvoie /api/press/images/..., on le complète avec le serveur distant
          this.formData.mediaUrl = res.url.startsWith('/') 
            ? 'http://localhost:8083/ftn' + res.url 
            : res.url;
          this.loading = false;
          this.showMessage('🖼️ Image importée !', 'success');
        },
        error: () => {
          this.loading = false;
          this.showMessage('❌ Erreur lors de l\'import.', 'error');
        }
      });
    }
  }

  onPdfSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.loading = true;
      this.pressService.uploadFile(file).subscribe({
        next: (res) => {
          const fileUrl = res.url.startsWith('/') 
            ? 'http://localhost:8083/ftn' + res.url 
            : res.url;
          if (this.formData.documents) {
            this.formData.documents += ',' + fileUrl;
          } else {
            this.formData.documents = fileUrl;
          }
          this.loading = false;
          this.showMessage('📄 PDF importé avec succès !', 'success');
        },
        error: () => {
          this.loading = false;
          this.showMessage('❌ Erreur lors de l\'import du PDF.', 'error');
        }
      });
    }
  }

  publish(item: PressItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.pressService.publish(item.idPressItem!).subscribe({ next: () => {
      this.loadAll();
      this.showMessage('🚀 Article publié avec succès !', 'success');
    }});
  }

  archive(item: PressItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.pressService.archive(item.idPressItem!).subscribe({
      next: () => {
        this.loadAll();
        this.showMessage('📁 Article archivé avec succès', 'success');
      },
      error: (err) => {
        const errorMsg = err.error || 'Erreur lors de l\'archivage';
        this.showMessage(`❌ ${errorMsg}`, 'error');
      }
    });
  }

  setDraft(item: PressItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.pressService.draft(item.idPressItem!).subscribe({ next: () => {
      this.loadAll();
      this.showMessage('📝 Article remis en brouillon', 'success');
    }});
  }

  getPopularArticles(): PressItem[] {
    return [...this.items]
      .filter(i => i.status === 'PUBLISHED')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }

  // État de la modale de confirmation
  showConfirmModal = false;
  modalTitle = '';
  modalMessage = '';
  itemToConfirm: PressItem | null = null;
  isHardDelete = false;

  // Ouvrir la modale pour mise en corbeille
  openTrashModal(item: PressItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.itemToConfirm = item;
    this.isHardDelete = false;
    this.modalTitle = 'Mettre en corbeille';
    this.modalMessage = `Voulez-vous vraiment déplacer "${item.title}" dans la corbeille ?`;
    this.showConfirmModal = true;
  }

  // Ouvrir la modale pour suppression définitive
  openDeleteModal(item: PressItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.itemToConfirm = item;
    this.isHardDelete = true;
    this.modalTitle = 'Suppression définitive';
    this.modalMessage = `⚠️ Attention : "${item.title}" sera supprimé pour toujours. Cette action est irréversible !`;
    this.showConfirmModal = true;
  }

  // Action finale après confirmation dans la modale
  confirmAction(): void {
    if (!this.itemToConfirm) return;
    
    console.log(`Tentative de suppression/corbeille de l'item ID: ${this.itemToConfirm.idPressItem}, Statut actuel: ${this.itemToConfirm.status}`);
    
    this.pressService.delete(this.itemToConfirm.idPressItem!).subscribe({
      next: () => {
        console.log('✅ Action réussie sur le serveur');
        this.loadAll(); // Recharge la liste depuis le serveur
        this.showConfirmModal = false;
        if (this.isHardDelete) {
          this.showMessage('❌ Article supprimé définitivement.', 'success');
        } else {
          this.showMessage('🗑️ Article déplacé ! Cliquez sur le filtre "Corbeille" pour le voir.', 'success');
        }
      },
      error: (err) => {
        console.error('❌ Erreur serveur:', err);
        this.showConfirmModal = false;
        // On récupère le message d'erreur s'il existe dans le corps de la réponse
        const errorMsg = err.error || 'Erreur inconnue';
        this.showMessage(`❌ ${errorMsg}`, 'error');
      }
    });
  }

  // Annuler la modale
  closeModal(): void {
    this.showConfirmModal = false;
    this.itemToConfirm = null;
  }

  restore(item: PressItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.pressService.draft(item.idPressItem!).subscribe({ 
      next: () => {
        this.loadAll();
        this.showMessage('Élément restauré en brouillon', 'success');
      }
    });
  }

  getStatusClass(status?: string): string {
    const s = (status || 'DRAFT').toUpperCase();
    if (s === 'PUBLISHED') return 'badge-published';

    if (s === 'SCHEDULED') return 'badge-scheduled';
    if (s === 'ARCHIVED') return 'badge-archived';
    if (s === 'DELETED') return 'badge-deleted';
    return 'badge-draft';
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3500);
  }
}

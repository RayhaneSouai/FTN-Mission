import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PressItem, PressType } from '../../models/press-item.model';
import { PressStats } from '../../models/press-stats.model';
import { PressService } from '../../services/press.service';

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
  types: PressType[] = ['ARTICLE', 'VIDEO', 'PHOTO', 'COMMUNIQUE'];
  disciplines: string[] = ['Natation', 'Water-Polo', 'Plongeon', 'Natation Artistique', 'Eau Libre', 'Général'];

  // Modal Form State
  showForm = false;
  editingItem = false;
  submitting = false;
  formData: PressItem = this.getEmptyItem();

  constructor(
    public pressService: PressService,
    private router: Router
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
      type: 'ARTICLE'
    };
  }

  openAddForm(): void {
    this.editingItem = false;
    this.formData = this.getEmptyItem();
    this.showForm = true;
  }

  openEditForm(item: PressItem): void {
    this.editingItem = true;
    this.formData = { ...item };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  saveItem(): void {
    if (!this.formData.title || !this.formData.content || !this.formData.discipline) {
      this.showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    this.submitting = true;
    const action$ = this.editingItem 
      ? this.pressService.update(this.formData.idPressItem!, this.formData)
      : this.pressService.add(this.formData);

    action$.subscribe({
      next: () => {
        this.submitting = false;
        this.showForm = false;
        this.loadAll();
        this.showMessage(this.editingItem ? '✅ Article mis à jour' : '✅ Article ajouté', 'success');
      },
      error: () => {
        this.submitting = false;
        this.showMessage('❌ Erreur lors de l\'enregistrement', 'error');
      }
    });
  }

  fetchFromUrl(): void {
    if (!this.formData.linkUrl) {
      this.showMessage('Veuillez entrer un lien valide.', 'error');
      return;
    }

    this.loading = true;
    this.pressService.fetchMetadata(this.formData.linkUrl).subscribe({
      next: (data: any) => {
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
            const sentences = rawContent.split(/[.!?]\s+/);
            this.formData.content = sentences.slice(0, 3).join('. ') + (sentences.length > 0 ? '.' : '');
          }
          this.showMessage('✨ Données extraites !', 'success');
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showMessage('❌ Erreur lors de l\'extraction.', 'error');
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.loading = true;
      this.pressService.uploadFile(file).subscribe({
        next: (res) => {
          this.formData.mediaUrl = res.url.startsWith('http')
            ? res.url
            : `http://localhost:8083/ftn${res.url}`;
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

  publish(item: PressItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.pressService.publish(item.idPressItem!).subscribe({ next: () => this.loadAll() });
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
    this.pressService.draft(item.idPressItem!).subscribe({ next: () => this.loadAll() });
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
    if (status === 'PUBLISHED') return 'badge-published';
    if (status === 'ARCHIVED') return 'badge-archived';
    if (status === 'DELETED') return 'badge-deleted';
    return 'badge-draft';
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3500);
  }
}

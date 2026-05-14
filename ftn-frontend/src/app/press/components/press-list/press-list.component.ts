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

  constructor(public pressService: PressService, private router: Router) {}

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

  goToAdd(): void { this.router.navigate(['/press/add']); }
  goToEdit(id: number): void { this.router.navigate(['/press/edit', id]); }

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

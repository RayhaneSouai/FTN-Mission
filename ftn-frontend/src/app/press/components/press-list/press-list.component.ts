import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PressItem, PressType } from '../../models/press-item.model';
import { PressService } from '../../services/press.service';

@Component({
  selector: 'app-press-list',
  templateUrl: './press-list.component.html',
  styleUrls: ['./press-list.component.css']
})
export class PressListComponent implements OnInit {
  items: PressItem[] = [];
  filterType: string = 'ALL';
  loading = false;
  searchTerm: string = '';
  stats = { total: 0, published: 0, draft: 0, video: 0 };
  message = '';
  messageType: 'success' | 'error' = 'success';
  types: PressType[] = ['ARTICLE', 'VIDEO', 'PHOTO', 'COMMUNIQUE'];

  constructor(public pressService: PressService, private router: Router) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.items.length;
    this.stats.published = this.items.filter(i => i.status === 'PUBLISHED').length;
    this.stats.draft = this.items.filter(i => i.status === 'DRAFT').length;
    this.stats.video = this.items.filter(i => i.type === 'VIDEO').length;
  }

  getItemsByType(type: string): PressItem[] {
    let filtered = this.items.filter(i => i.type === type);
    if (this.searchTerm) {
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        i.content.toLowerCase().includes(this.searchTerm.toLowerCase())
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

  goToAdd(): void { this.router.navigate(['/press/add']); }
  goToEdit(id: number): void { this.router.navigate(['/press/edit', id]); }

  publish(item: PressItem): void {
    this.pressService.publish(item.idPressItem!).subscribe({ next: () => this.loadAll() });
  }

  archive(item: PressItem): void {
    this.pressService.archive(item.idPressItem!).subscribe({ next: () => this.loadAll() });
  }

  setDraft(item: PressItem): void {
    // Dans notre service on peut simplement faire un update pour changer le statut
    const updated = { ...item, status: 'DRAFT' as const };
    this.pressService.update(item.idPressItem!, updated).subscribe({ next: () => this.loadAll() });
  }

  delete(item: PressItem): void {
    if (!confirm(`Supprimer "${item.title}" ?`)) return;
    this.pressService.delete(item.idPressItem!).subscribe({ next: () => this.loadAll() });
  }

  getStatusClass(status?: string): string {
    if (status === 'PUBLISHED') return 'badge-published';
    if (status === 'ARCHIVED') return 'badge-archived';
    return 'badge-draft';
  }
}

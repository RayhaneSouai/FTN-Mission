import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';

interface QuickSearchItem {
  label: string;
  subtitle: string;
  path: string;
  icon: string;
  keywords: string;
}

@Component({
  selector: 'app-admin-quick-search',
  templateUrl: './admin-quick-search.component.html',
  styleUrls: ['./admin-quick-search.component.css']
})
export class AdminQuickSearchComponent {
  @Output() closed = new EventEmitter<void>();

  open = false;
  query = '';
  activeIndex = 0;

  private readonly items: QuickSearchItem[] = [
    { label: 'Tableau de bord', subtitle: 'Vue d\'ensemble', path: '/admin', icon: 'bi-speedometer2', keywords: 'dashboard accueil' },
    { label: 'Utilisateurs', subtitle: 'Gestion des membres', path: '/admin/utilisateurs', icon: 'bi-people', keywords: 'users membres inscriptions' },
    { label: 'Import utilisateurs CSV', subtitle: 'Import en masse', path: '/admin/utilisateurs/import', icon: 'bi-file-earmark-arrow-up', keywords: 'import csv bulk' },
    { label: 'Licences', subtitle: 'Licences et nageurs', path: '/admin/licences', icon: 'bi-card-checklist', keywords: 'licenses saison' },
    { label: 'Mon profil', subtitle: 'Compte et sécurité', path: '/admin/mon-profil', icon: 'bi-person-circle', keywords: 'profile parametres mot de passe' }
  ];

  constructor(private router: Router) {}

  get filtered(): QuickSearchItem[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.items;
    return this.items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.subtitle.toLowerCase().includes(q) ||
        i.keywords.includes(q)
    );
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
      return;
    }
    if (!this.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, Math.max(0, this.filtered.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
    }
    if (event.key === 'Enter' && this.filtered[this.activeIndex]) {
      event.preventDefault();
      this.navigate(this.filtered[this.activeIndex]);
    }
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) {
      this.query = '';
      this.activeIndex = 0;
      setTimeout(() => document.getElementById('adminQuickSearchInput')?.focus(), 50);
    } else {
      this.close();
    }
  }

  close(): void {
    this.open = false;
    this.closed.emit();
  }

  navigate(item: QuickSearchItem): void {
    this.router.navigateByUrl(item.path);
    this.close();
  }

  onQueryChange(): void {
    this.activeIndex = 0;
  }
}

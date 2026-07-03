import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PressItem } from '../press/models/press-item.model';
import { PressService } from '../press/services/press.service';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  @ViewChild('partnersCarousel') partnersCarousel?: ElementRef<HTMLDivElement>;

  private readonly articleImages = [
    'https://images.unsplash.com/photo-1560090947-5307abc46ffc?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200'
  ];
  private readonly coupeImages = [
    'https://plus.unsplash.com/premium_photo-1713836954462-6e6cd1eecc1c?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1754487436530-11d3140ec634?fm=jpg&q=80&w=1200&auto=format&fit=crop'
  ];

  openPartnerPopup(): void {
    this.partnerPopupOpen = true;
  }

  closePartnerPopup(): void {
    this.partnerPopupOpen = false;
  }

  partners = [
    {
      name: 'Safia',
      category: 'Eau Minérale',
      initials: 'SA',
      description: 'Partenaire officiel hydratation et bien-être des nageurs.',
      image: 'assets/partners/safia.png'
    },
    {
      name: 'Decathlon Tunisie',
      category: 'Équipement Sportif',
      initials: 'DE',
      description: 'Fournisseur d’équipements sportifs et accessoires de natation.',
      image: 'assets/partners/decathlon.png'
    },
    {
      name: 'GO Sport',
      category: 'Sport',
      initials: 'GS',
      description: 'Soutien aux compétitions et aux événements sportifs nationaux.',
      image: 'assets/partners/gosport.png'
    },
    {
      name: 'COMAR Assurances',
      category: 'Assurance',
      initials: 'CO',
      description: 'Accompagnement et soutien des sportifs tunisiens.',
      image: 'assets/partners/comar.png'
    },
    {
      name: 'World Aquatics',
      category: 'Fédération Internationale',
      initials: 'WA',
      description: 'Organisation internationale gouvernant les sports aquatiques.',
      image: 'assets/partners/world-aquatics.png'
    }
  ];

  partnerPopupOpen = false;

  cards = [
    { title: 'Compétitions', description: 'Calendrier et résultats', icon: 'trophy', color: '#1565C0' },
    { title: 'Équipes Nationales', description: 'Natation et Water Polo', icon: 'users', color: '#1565C0' },
    { title: 'Stages', description: 'Formations et stages', icon: 'calendar', color: '#1565C0' },
    { title: 'Règlements', description: 'Documents officiels', icon: 'book', color: '#1565C0' }
  ];

  news: PressItem[] = [];
  loading = false;
  isLoggedIn = false;

  constructor(
    public pressService: PressService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    this.loadNews();
  }

  loadNews(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        // Filtrer les articles publiés et prendre la dernière actualité en vedette + 3 cartes.
        this.news = data
          .filter(item => item.status === 'PUBLISHED')
          .sort((a, b) => (b.idPressItem || 0) - (a.idPressItem || 0))
          .slice(0, 4);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openLink(url?: string): void {
    if (url) window.open(url, '_blank');
  }

  get featuredNews(): PressItem | null {
    return this.news[0] ?? null;
  }

  get secondaryNews(): PressItem[] {
    return this.news.slice(1, 4);
  }

  newsImage(item: PressItem, index = 0): string {
    if (item.type === 'VIDEO') {
      return this.pressService.getVideoThumbnail(item.mediaUrl || '');
    }
    return item.mediaUrl || this.fallbackNewsImage(item, index);
  }

  fallbackNewsImage(item: PressItem, index = 0): string {
    const haystack = `${item.title || ''} ${item.summary || ''} ${item.content || ''}`.toLowerCase();
    if (haystack.includes('coupe') || haystack.includes('troph') || haystack.includes('finale')) {
      return this.coupeImages[index % this.coupeImages.length];
    }
    return this.articleImages[index % this.articleImages.length];
  }

  onNewsImageError(event: Event, item: PressItem, index = 0): void {
    const img = event.target as HTMLImageElement;
    img.src = this.fallbackNewsImage(item, index);
  }

  newsTypeLabel(item: PressItem): string {
    if (item.type === 'VIDEO') return 'Vidéo';
    if (item.type === 'PHOTO') return 'Photo';
    if (item.type === 'COMMUNIQUE') return 'Communiqué';
    return 'Actualité';
  }

  scrollPartners(direction: 'prev' | 'next'): void {
    const carousel = this.partnersCarousel?.nativeElement;
    if (!carousel) return;
    const amount = Math.min(360, carousel.clientWidth * 0.85);
    carousel.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth'
    });
  }

  plainText(value?: string | null): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

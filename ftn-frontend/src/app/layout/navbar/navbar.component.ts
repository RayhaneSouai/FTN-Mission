import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  user: any = null;
  isLoggedIn = false;
  isAdmin = false;
  isScrolled = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
      if (isPlatformBrowser(this.platformId)) {
        this.isAdmin = localStorage.getItem('isAdmin') === 'true';
      }
    });
    this.updateScrollState();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 80;
    }
  }

  logout() {
    this.authService.logout();
  }

  get displayName(): string {
    if (!this.user) {
      return '';
    }
    const firstName = this.user.firstName ?? this.user.first_name ?? '';
    const lastName = this.user.lastName ?? this.user.last_name ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || this.user.email || 'Utilisateur';
  }

  get userRoleLabel(): string {
    const role = this.user?.role;
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      ADMINISTRATEUR: 'Administrateur',
      SWIMMER: 'Nageur',
      COACH: 'Coach',
      VISITOR: 'Visiteur'
    };
    return labels[role] ?? role ?? 'Utilisateur';
  }

  get isSwimmer(): boolean {
    return this.user?.role === 'SWIMMER';
  }

  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.displayName)}&background=004da3&size=40&color=fff`;
  }

  handleConnexion() {
    if (this.isLoggedIn) {
      this.router.navigate(['/mon-profil']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}

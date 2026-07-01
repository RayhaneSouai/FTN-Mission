import { Component, HostListener, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { ClubService } from '../../features/clubs/services/club.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: any = null;
  isLoggedIn = false;
  isAdmin = false;
  isScrolled = false;

  notifications: any[] = [];
  showNotificationsDropdown = false;
  private pollingIntervalId: any = null;
  currentSeason = '2025/2026';

  constructor(
    private router: Router,
    private authService: AuthService,
    private clubService: ClubService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
      if (isPlatformBrowser(this.platformId)) {
        this.isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        if (this.isCoach) {
          this.loadNotifications();
          this.startPolling();
        } else {
          this.stopPolling();
          this.notifications = [];
        }
      }
    });
    this.updateScrollState();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get isCoach(): boolean {
    return this.user?.role === 'COACH' || this.user?.role === 'ENTRAINEUR';
  }

  startPolling(): void {
    this.stopPolling();
    if (isPlatformBrowser(this.platformId)) {
      this.pollingIntervalId = setInterval(() => this.loadNotifications(), 15000);
    }
  }

  stopPolling(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  loadNotifications(): void {
    if (!this.isCoach) return;
    this.notificationService.getMyNotifications().subscribe({
      next: (res: any[]) => {
        this.notifications = (res || [])
          .filter(n => !n.read)
          .map(n => ({
            id: n.id,
            title: n.title,
            description: n.message,
            type: 'warning',
            time: n.createdAt
          }));
      },
      error: (err) => {
        console.error('Erreur chargement notifications coach', err);
      }
    });
  }

  toggleNotificationsDropdown(event: Event): void {
    event.stopPropagation();
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showNotificationsDropdown = false;
  }

  goToValidation(notif: any, event: Event): void {
    event.stopPropagation();
    this.showNotificationsDropdown = false;
    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => {
        console.error('Erreur lors du marquage comme lu', err);
      }
    });
    this.router.navigate(['/mon-profil'], { queryParams: { tab: 'club' } });
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

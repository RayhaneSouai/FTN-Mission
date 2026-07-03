import { Component, HostListener, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { ClubService } from '../../features/clubs/services/club.service';
import { NotificationService } from '../../shared/services/notification.service';
import { WebSocketService, AppNotificationDTO } from '../../core/services/websocket.service';
import { Subscription } from 'rxjs';

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
    private webSocketService: WebSocketService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private wsSubscription?: Subscription;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
      if (isPlatformBrowser(this.platformId)) {
        this.isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        if (this.isCoach || this.isSwimmer) {
          this.loadNotifications();
          this.webSocketService.connect();
          if (!this.wsSubscription) {
            this.wsSubscription = this.webSocketService.notifications$.subscribe(notification => {
              if (notification) {
                this.notifications.unshift({
                  id: notification.id,
                  title: notification.title,
                  description: notification.message,
                  type: 'warning',
                  time: notification.createdAt
                });
              }
            });
          }
        } else {
          this.webSocketService.disconnect();
          this.notifications = [];
        }
      }
    });
    this.updateScrollState();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  get isCoach(): boolean {
    return this.user?.role === 'COACH' || this.user?.role === 'ENTRAINEUR';
  }

  loadNotifications(): void {
    if (!this.isCoach && !this.isSwimmer) return;
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

  get showMesFormationsMenu(): boolean {
    return this.isSwimmer || this.isCoach;
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

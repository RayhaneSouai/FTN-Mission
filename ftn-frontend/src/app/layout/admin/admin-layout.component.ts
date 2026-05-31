import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from '../../features/users/services/user.service';
import { AdminToastService } from '../../shared/admin-ui/services/admin-toast.service';
import { AdminBreadcrumbItem } from '../../shared/admin-ui/components/admin-breadcrumb/admin-breadcrumb.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('contentBody') contentBody?: ElementRef<HTMLElement>;

  user: any = null;
  isSidebarCollapsed = false;
  mobileSidebarOpen = false;
  compactMode = false;
  showScrollTop = false;

  pendingUsers: any[] = [];
  showNotificationsDropdown = false;
  loadingNotifications = false;
  notificationError = '';
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  showRejectModal = false;
  userToReject: any = null;
  breadcrumbs: AdminBreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private toast: AdminToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.compactMode = localStorage.getItem('adminCompactMode') === '1';
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
        this.loadPendingRegistrations();
        this.startPolling();
        this.updateBreadcrumbs();
        this.router.events
          .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
          .subscribe(() => {
            this.updateBreadcrumbs();
            this.closeMobileSidebar();
          });
      } else {
        this.router.navigate(['/auth/login']);
      }
    }
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url.split('?')[0];
    const crumbs: AdminBreadcrumbItem[] = [];
    if (url === '/admin' || url === '/admin/') {
      crumbs.push({ label: 'Tableau de bord' });
    } else if (url.startsWith('/admin/utilisateurs')) {
      crumbs.push({ label: 'Utilisateurs', path: '/admin/utilisateurs' });
      if (url.includes('/import')) {
        crumbs.push({ label: 'Import CSV' });
      } else if (url !== '/admin/utilisateurs') {
        crumbs.push({ label: 'Détail' });
      }
    } else if (url.startsWith('/admin/licences')) {
      crumbs.push({ label: 'Licences', path: '/admin/licences' });
    } else if (url.startsWith('/admin/mon-profil')) {
      crumbs.push({ label: 'Mon profil', path: '/admin/mon-profil' });
      if (url.endsWith('/settings')) {
        crumbs.push({ label: 'Paramètres' });
      } else {
        crumbs.push({ label: 'Vue globale' });
      }
    } else if (url.startsWith('/admin/competitions')) {
      crumbs.push({ label: 'Compétitions', path: '/admin/competitions' });
      if (url.includes('/programme')) {
        crumbs.push({ label: 'Programme' });
      } else if (url.includes('/distribution')) {
        crumbs.push({ label: 'Distribution' });
      }
    } else if (url.startsWith('/admin/participations')) {
      crumbs.push({ label: 'Participations' });
    } else if (url.startsWith('/admin/clubs')) {
      crumbs.push({ label: 'Clubs' });
    } else if (url.startsWith('/admin/press')) {
      crumbs.push({ label: 'Gestion Presse' });
    } else if (url.startsWith('/admin/performances')) {
      crumbs.push({ label: 'Performances' });
      if (url.includes('/new')) {
        crumbs.push({ label: 'Nouvelle performance' });
      }
    } else if (url.startsWith('/admin/partenariats')) {
      crumbs.push({ label: 'Partenariats & Sponsoring' });
    } else if (url.startsWith('/admin/formations')) {
      crumbs.push({ label: 'Formations' });
    } else if (url.startsWith('/admin/ranking')) {
      crumbs.push({ label: 'Classements' });
    } else {
      crumbs.push({ label: 'Administration' });
    }
    this.breadcrumbs = crumbs;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  startPolling(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pollingIntervalId = setInterval(() => this.loadPendingRegistrations(), 15000);
    }
  }

  stopPolling(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
  }

  loadPendingRegistrations(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.pendingUsers = users.filter(
          (u: { registrationStatus?: string; role?: string }) =>
            u.registrationStatus === 'EN_ATTENTE' && u.role !== 'ADMIN'
        );
        this.notificationError = '';
      },
      error: () => {
        this.notificationError = '';
      }
    });
  }

  toggleNotificationsDropdown(event: Event): void {
    event.stopPropagation();
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      this.loadPendingRegistrations();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showNotificationsDropdown = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showNotificationsDropdown = false;
    if (this.showRejectModal) {
      this.closeRejectModal();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId) && window.innerWidth > 992) {
      this.mobileSidebarOpen = false;
    }
  }

  approveUser(userId: number, event: Event): void {
    event.stopPropagation();
    this.loadingNotifications = true;
    this.userService.approveUser(userId).subscribe({
      next: () => {
        this.loadingNotifications = false;
        this.loadPendingRegistrations();
        this.toast.success('Inscription acceptée avec succès');
      },
      error: () => {
        this.loadingNotifications = false;
        this.toast.error('Impossible d\'accepter cette inscription');
      }
    });
  }

  rejectUser(userId: number, event: Event): void {
    event.stopPropagation();
    this.showNotificationsDropdown = false;
    const targetUser = this.pendingUsers.find((u) => u.id === userId);
    if (targetUser) {
      this.userToReject = targetUser;
      this.showRejectModal = true;
    }
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.userToReject = null;
  }

  confirmRejectUser(): void {
    if (!this.userToReject) return;
    this.loadingNotifications = true;
    this.userService.rejectUser(this.userToReject.id).subscribe({
      next: () => {
        this.loadingNotifications = false;
        this.closeRejectModal();
        this.loadPendingRegistrations();
        this.toast.success('Inscription refusée');
      },
      error: () => {
        this.loadingNotifications = false;
        this.toast.error('Impossible de refuser cette inscription');
      }
    });
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      SWIMMER: 'Nageur',
      COACH: 'Coach',
      ADMIN: 'Administrateur',
      VISITOR: 'Visiteur'
    };
    return map[role] ?? role;
  }

  relativeTime(dateInput: string | number[] | Date): string {
    if (!dateInput) return '';
    let date: Date;
    if (Array.isArray(dateInput)) {
      date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
    } else {
      date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    return `Il y a ${days} j`;
  }

  toggleSidebar(): void {
    if (isPlatformBrowser(this.platformId) && window.innerWidth <= 992) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
      return;
    }
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  toggleCompactMode(): void {
    this.compactMode = !this.compactMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('adminCompactMode', this.compactMode ? '1' : '0');
    }
    this.toast.show(
      this.compactMode ? 'Mode compact activé' : 'Mode confort activé',
      'info',
      2500
    );
  }

  onContentScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.showScrollTop = el.scrollTop > 280;
  }

  scrollToTop(): void {
    this.contentBody?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.router.navigate(['/auth/login']);
    }
  }
}

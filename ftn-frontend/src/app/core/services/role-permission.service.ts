import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Droits UI (utilisateurs, licences) : seul l’admin modifie ; les autres rôles en consultation.
 */
@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  private parseUser(): { role?: string } | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = sessionStorage.getItem('user');
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as { role?: string };
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    if (sessionStorage.getItem('isAdmin') === 'true') {
      return true;
    }
    const r = this.parseUser()?.role;
    return r === 'ADMIN' || r === 'ADMINISTRATEUR';
  }
}

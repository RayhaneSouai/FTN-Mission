import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && (user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR')) {
          return router.createUrlTree(['/admin']);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      return router.createUrlTree(['/admin']);
    }
  }
  
  return true;
};

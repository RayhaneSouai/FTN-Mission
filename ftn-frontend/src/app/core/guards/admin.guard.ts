import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      return true;
    }
  }
  
  return router.createUrlTree(['/auth/login']);
};

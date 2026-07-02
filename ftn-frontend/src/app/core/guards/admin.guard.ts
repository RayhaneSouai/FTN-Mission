import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Admin backoffice: requires JWT + isAdmin flag set at login. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = sessionStorage.getItem('token');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    const userStr = sessionStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && (user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR')) {
          return true;
        }
      } catch (e) {
        console.error('Error parsing user from sessionStorage', e);
      }
    }

    if (token && isAdmin) {
      return true;
    }
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
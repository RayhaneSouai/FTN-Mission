import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Partner space: requires JWT + role PARTNER */
export const partnerGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (token && role === 'PARTNER') {
      return true;
    }
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};


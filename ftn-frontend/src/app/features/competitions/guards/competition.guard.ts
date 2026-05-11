import { CanActivateFn } from '@angular/router';

/**
 * Production-ready functional guard skeleton.
 * Replace the `true` return with actual auth/role checks
 * once the authentication module is wired up.
 */
export const competitionAccessGuard: CanActivateFn = (_route, _state) => {
    // TODO: inject AuthService and verify user roles
    return true;
};

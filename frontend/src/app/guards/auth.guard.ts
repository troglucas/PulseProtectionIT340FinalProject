import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/*
Checks that the user is logged in by checking sessionStorage for the 'isLoggedIn' flag.
If the user is not logged in, it redirects them to the login page.
*/
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId) && sessionStorage.getItem('isLoggedIn') === 'true') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  togglePassword(show: boolean) {
    this.showPassword = show;
  }

  login() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('token', res.token);
          this.authService.setUser(res.user);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          if (res.user.role === 'ADMIN' || res.user.role === 'ADMINISTRATEUR') {
            sessionStorage.setItem('isAdmin', 'true');
            this.router.navigate(['/admin']);
          } else {
            sessionStorage.removeItem('isAdmin');
            this.router.navigate(['/']);
          }

          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else if (res.user.role === 'ADMIN' || res.user.role === 'ADMINISTRATEUR') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'Email ou mot de passe incorrect.';
        console.error(err);
      }
    });
  }
}

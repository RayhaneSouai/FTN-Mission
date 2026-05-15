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
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          if (res.user.role === 'ADMIN' || res.user.role === 'ADMINISTRATEUR') {
            localStorage.setItem('isAdmin', 'true');
          } else {
            localStorage.removeItem('isAdmin');
          }

          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else if (res.user.role === 'ADMIN' || res.user.role === 'ADMINISTRATEUR') {
            this.router.navigate(['/utilisateurs']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Email ou mot de passe incorrect';
        console.error(err);
      }
    });
  }
}

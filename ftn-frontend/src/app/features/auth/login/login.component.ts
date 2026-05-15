import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
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
          this.authService.setUser(res.user);
          
          // Check if the user is an admin based on the backend response
          if (res.user.role === 'ADMIN' || res.user.role === 'ADMINISTRATEUR') {
            localStorage.setItem('isAdmin', 'true');
            this.router.navigate(['/admin']);
          } else if (res.user.role === 'SWIMMER' || res.user.role === 'NAGEUR') {
            localStorage.removeItem('isAdmin');
            this.router.navigate(['/espace-nageur/dashboard']);
          } else {
            // COACH, VISITOR or other
            localStorage.removeItem('isAdmin');
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

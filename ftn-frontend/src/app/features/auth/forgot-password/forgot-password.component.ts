import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/login.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  errorMessage: string = '';
  loading = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email) {
      this.errorMessage = "Veuillez entrer une adresse email.";
      this.message = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.message = '';

    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.message = "Un lien de réinitialisation a été envoyé à votre adresse email.";
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || "Impossible d'envoyer le lien de réinitialisation.";
      }
    });
  }
}

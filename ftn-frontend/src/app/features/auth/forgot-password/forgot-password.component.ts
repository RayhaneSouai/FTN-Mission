import { Component } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/login.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  errorMessage: string = '';

  onSubmit() {
    if (!this.email) {
      this.errorMessage = "Veuillez entrer une adresse email.";
      this.message = '';
      return;
    }
    
    // Simulate API call for now
    this.errorMessage = '';
    this.message = "Un lien de réinitialisation a été envoyé à votre adresse email (simulation).";
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm, NgModel } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.css', './register.component.css']
})
export class RegisterComponent {
  step: 1 | 2 = 1;
  /** Not sent to the API — validation only */
  confirmPassword = '';
  step1SubmitAttempted = false;

  userData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'SWIMMER',
    gender: '',
    birthDate: '',
    discipline: '',
    niveau: '',
    anciennete: null as number | null
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  goToStep2(form: NgForm): void {
    this.step1SubmitAttempted = true;
    const step1Names = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'] as const;
    for (const name of step1Names) {
      form.controls[name]?.markAsTouched();
    }

    const pwd = this.userData.password || '';
    if (
      !form.controls['firstName']?.valid ||
      !form.controls['lastName']?.valid ||
      !form.controls['email']?.valid ||
      !form.controls['password']?.valid ||
      !form.controls['confirmPassword']?.valid
    ) {
      return;
    }
    if (pwd.length < 6 || pwd !== (this.confirmPassword || '')) {
      return;
    }

    this.step1SubmitAttempted = false;
    this.errorMessage = '';
    this.step = 2;
  }

  goToStep1(): void {
    this.step = 1;
    this.errorMessage = '';
    this.step1SubmitAttempted = false;
  }

  passwordsMismatch(): boolean {
    return (this.userData.password || '') !== (this.confirmPassword || '');
  }

  private shouldShowConfirmErrors(ctrl: NgModel): boolean {
    return !!(ctrl.dirty || ctrl.touched || this.step1SubmitAttempted);
  }

  confirmPasswordError(ctrl: NgModel): string | null {
    if (!this.shouldShowConfirmErrors(ctrl)) {
      return null;
    }
    const v = ((ctrl.value as string) || '').trim();
    if (!v) {
      return 'Confirmation requise.';
    }
    const pwd = this.userData.password || '';
    if (pwd.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (v !== pwd) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return null;
  }

  confirmPasswordInvalid(ctrl: NgModel): boolean {
    return this.confirmPasswordError(ctrl) !== null;
  }

  register(): void {
    if (this.step !== 2 || this.passwordsMismatch()) {
      return;
    }

    const dataToSend: Record<string, unknown> = { ...this.userData };
    if (!dataToSend['birthDate']) {
      dataToSend['birthDate'] = null;
    }
    if (dataToSend['anciennete'] === null || dataToSend['anciennete'] === undefined) {
      dataToSend['anciennete'] = null;
    }
    if (!dataToSend['gender']) {
      dataToSend['gender'] = null;
    }
    if (!dataToSend['discipline']) {
      dataToSend['discipline'] = null;
    }
    if (!dataToSend['niveau']) {
      dataToSend['niveau'] = null;
    }

    this.authService.register(dataToSend).subscribe({
      next: () => {
        this.successMessage =
          'Inscription réussie ! Votre compte est en attente de validation par un administrateur.';
        setTimeout(() => this.router.navigate(['/auth/login']), 4000);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          "Erreur lors de l'inscription. Les données sont peut-être invalides.";
        console.error('Registration error:', err);
      }
    });
  }
}

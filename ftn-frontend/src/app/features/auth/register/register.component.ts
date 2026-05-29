import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm, NgModel } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import {
  PASSWORD_POLICY_RULES,
  passwordPolicyErrorMessage,
  validatePasswordStrength
} from '../../../shared/utils/password-policy';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.css', './register.component.css']
})
export class RegisterComponent {
  readonly passwordPolicyRules = PASSWORD_POLICY_RULES;

  step: 1 | 2 = 1;
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

  onRoleChange(role: string): void {
    this.userData.role = role;
    if (role === 'COACH') {
      this.userData.discipline = '';
      this.userData.niveau = '';
    } else if (role === 'SWIMMER') {
      this.userData.anciennete = null;
    }
  }

  passwordFieldError(): string | null {
    const pwd = this.userData.password || '';
    if (!pwd) {
      return null;
    }
    return passwordPolicyErrorMessage(pwd);
  }

  passwordFieldInvalid(): boolean {
    const pwd = this.userData.password || '';
    if (!pwd) {
      return false;
    }
    return !validatePasswordStrength(pwd).valid;
  }

  goToStep2(form: NgForm): void {
    this.step1SubmitAttempted = true;
    const step1Names = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'] as const;
    for (const name of step1Names) {
      form.controls[name]?.markAsTouched();
    }

    const pwd = this.userData.password || '';
    const policy = validatePasswordStrength(pwd);
    if (
      !form.controls['firstName']?.valid ||
      !form.controls['lastName']?.valid ||
      !form.controls['email']?.valid ||
      !policy.valid ||
      pwd !== (this.confirmPassword || '')
    ) {
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
    const policyMsg = passwordPolicyErrorMessage(pwd);
    if (policyMsg) {
      return policyMsg;
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

    const policy = validatePasswordStrength(this.userData.password || '');
    if (!policy.valid) {
      this.errorMessage = policy.errors.join(' ');
      return;
    }

    if (this.userData.role === 'SWIMMER') {
      if (!this.userData.discipline || !this.userData.niveau) {
        this.errorMessage = 'Discipline et niveau sont obligatoires pour un nageur.';
        return;
      }
    } else if (this.userData.role === 'COACH') {
      if (this.userData.anciennete === null || this.userData.anciennete === undefined || this.userData.anciennete < 0) {
        this.errorMessage = 'L\'ancienneté est obligatoire pour un coach.';
        return;
      }
    }

    const dataToSend: Record<string, unknown> = {
      firstName: this.userData.firstName.trim(),
      lastName: this.userData.lastName.trim(),
      email: this.userData.email.trim(),
      password: this.userData.password,
      role: this.userData.role,
      birthDate: this.userData.birthDate || null,
      gender: this.userData.gender || null
    };

    if (this.userData.role === 'SWIMMER') {
      dataToSend['discipline'] = this.userData.discipline || null;
      dataToSend['niveau'] = this.userData.niveau || null;
      dataToSend['anciennete'] = null;
    } else if (this.userData.role === 'COACH') {
      dataToSend['discipline'] = null;
      dataToSend['niveau'] = null;
      dataToSend['anciennete'] =
        this.userData.anciennete === null || this.userData.anciennete === undefined
          ? null
          : this.userData.anciennete;
    }

    this.authService.register(dataToSend).subscribe({
      next: (res) => {
        const status = res?.user?.registrationStatus;
        if (status === 'EN_ATTENTE') {
          this.successMessage =
            'Inscription enregistrée. Votre compte est en attente de validation par un administrateur — vous pourrez vous connecter après approbation.';
        } else {
          this.successMessage =
            'Inscription réussie ! Votre compte est en attente de validation par un administrateur.';
        }
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

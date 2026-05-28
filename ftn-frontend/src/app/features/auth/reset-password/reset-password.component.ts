import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PASSWORD_POLICY_RULES, validatePasswordStrength } from '../../../shared/utils/password-policy';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css', '../login/login.component.css']
})
export class ResetPasswordComponent implements OnInit {
  readonly passwordPolicyRules = PASSWORD_POLICY_RULES;

  token = '';
  accountSetup = false;
  password = '';
  confirmPassword = '';

  message = '';
  errorMessage = '';
  loading = false;
  validatingToken = true;
  tokenInvalid = false;
  success = false;

  showPassword = false;
  showConfirmPassword = false;
  emailHint: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.accountSetup = params['setup'] === '1' || params['setup'] === 'true';
      if (!this.token) {
        this.validatingToken = false;
        this.tokenInvalid = true;
        this.errorMessage = 'Lien invalide ou manquant.';
        return;
      }
      this.validateToken();
    });
  }

  private validateToken(): void {
    this.validatingToken = true;
    this.authService.validateResetToken(this.token).subscribe({
      next: (info) => {
        this.validatingToken = false;
        if (!info.valid) {
          this.tokenInvalid = true;
          this.errorMessage = info.message || 'Ce lien est invalible ou a expiré.';
          return;
        }
        this.accountSetup = info.accountSetup || this.accountSetup;
        this.emailHint = info.emailHint;
      },
      error: () => {
        this.validatingToken = false;
        this.tokenInvalid = true;
        this.errorMessage = 'Impossible de valider le lien. Réessayez plus tard.';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.message = '';

    if (!this.token) {
      this.errorMessage = 'Lien de réinitialisation invalide.';
      return;
    }

    const policy = validatePasswordStrength(this.password);
    if (!policy.valid) {
      this.errorMessage = policy.errors.join(' ');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.authService.resetPassword({ token: this.token, newPassword: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.message = this.accountSetup
          ? 'Votre mot de passe a été configuré. Vous pouvez maintenant vous connecter.'
          : 'Votre mot de passe a été réinitialisé avec succès.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Erreur lors de la réinitialisation. Le lien est peut-être expiré.';
      }
    });
  }
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/** Règles affichées dans les formulaires (register, reset, etc.) */
export const PASSWORD_POLICY_RULES: readonly string[] = [
  '8 caractères minimum',
  'Au moins une majuscule et une minuscule',
  'Au moins un chiffre',
  'Au moins un caractère spécial (!@#$%…)'
];

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (!password || password.length < 8) {
    errors.push('Au moins 8 caractères.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre.');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Au moins un caractère spécial.');
  }
  return { valid: errors.length === 0, errors };
}

export function passwordPolicyErrorMessage(password: string): string | null {
  const result = validatePasswordStrength(password);
  return result.valid ? null : result.errors.join(' ');
}

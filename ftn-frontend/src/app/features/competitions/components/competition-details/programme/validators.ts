import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that a time string is in strict HH:mm format (00:00 - 23:59).
 */
export function timeFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // let required validator handle empty
    const pattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    return pattern.test(control.value) ? null : { timeFormat: true };
  };
}

/**
 * Validates that the time is strictly after a given reference time.
 * @param getLatestTime A function returning the latest time string (HH:mm) or null.
 */
export function timeAfterValidator(getLatestTime: () => string | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const latestTime = getLatestTime();
    if (!latestTime) return null; // no previous item, no constraint
    if (control.value <= latestTime) {
      return { timeNotAfter: { latestTime } };
    }
    return null;
  };
}

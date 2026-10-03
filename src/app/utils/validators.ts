import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Title обязателен и не может состоять из одних пробелов. */
export const titleRequiredValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (value.trim().length === 0) {
    return { titleRequired: true };
  }
  return null;
};

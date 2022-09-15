import { ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../api.service';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  switchMap,
  take,
  tap,
} from 'rxjs';

export function emailExistsValidator(
  apiService: ApiService,
  cdr: ChangeDetectorRef
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return control.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(1000),
      switchMap((value: string) => apiService.emailExists(value)),
      map((doesExists: boolean) => (doesExists ? { emailExists: true } : null)),
      take(1),
      tap(() => cdr.markForCheck())
    );
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (!value) {
      return null;
    }
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      return null;
    }
    return { invalidEmail: true };
  };
}

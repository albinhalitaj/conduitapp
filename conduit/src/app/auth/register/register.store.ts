import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { AuthService, RegisterForm } from '../auth.service';
import { exhaustMap, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

interface RegisterState {
  errors: Array<string> | null;
}

const initialState: RegisterState = {
  errors: null,
};

@Injectable()
export class RegisterStore extends ComponentStore<RegisterState> {
  readonly errors$: Observable<Array<string> | null> = this.select(
    (s: RegisterState) => s.errors
  );

  register = this.effect<RegisterForm>(
    exhaustMap((registerForm: RegisterForm) => {
      return this.authService.register(registerForm).pipe(
        tapResponse(
          () => {
            void this.router.navigate(['/login']);
          },
          ({ error }: HttpErrorResponse) => {
            const { title } = error;
            const errors = new Array<string>();
            if (title.startsWith('One or more')) {
              Object.values(error.errors).forEach((error: any) => {
                errors.push(error as string);
              });
            } else {
              errors.push(title);
            }
            this.setState({ errors: errors });
          }
        )
      );
    })
  );

  constructor(private authService: AuthService, private router: Router) {
    super(initialState);
  }
}

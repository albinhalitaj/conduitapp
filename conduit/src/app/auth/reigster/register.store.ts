import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { AuthService, RegisterForm } from '../auth.service';
import { exhaustMap } from 'rxjs';

interface RegisterState {
  errors: Array<string> | null;
}

const initialState: RegisterState = {
  errors: null,
};

@Injectable()
export class RegisterStore extends ComponentStore<RegisterState> {
  constructor(private authService: AuthService) {
    super(initialState);
  }

  register = this.effect<RegisterForm>(
    exhaustMap((registerForm: RegisterForm) => {
      return this.authService.register(registerForm).pipe(
        tapResponse(
          (response: any) => {
            console.log(response);
          },
          (err) => console.log(err)
        )
      );
    })
  );
}

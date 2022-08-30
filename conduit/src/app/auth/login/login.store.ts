import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { AuthService, LoginForm, LoginResponse } from '../auth.service';
import { exhaustMap, Observable } from 'rxjs';
import { AuthStore } from '../auth.store';
import { HttpErrorResponse } from '@angular/common/http';
import Cookies from 'js-cookie';

interface LoginState {
  error: string;
  loginSuccess: boolean;
}

const initialState: LoginState = {
  error: '',
  loginSuccess: false,
};

@Injectable()
export class LoginStore extends ComponentStore<LoginState> {
  readonly error$: Observable<string> = this.select((s: LoginState) => s.error);
  readonly loginSuccess$: Observable<boolean> = this.select(
    (s: LoginState) => s.loginSuccess
  );

  login = this.effect<LoginForm>(
    exhaustMap((loginForm: LoginForm) => {
      this.patchState({ error: '' });
      return this.authService.login(loginForm).pipe(
        tapResponse(
          ({ user }: LoginResponse) => {
            this.patchState({ loginSuccess: true });
            Cookies.set('user', JSON.stringify(user), {
              expires: new Date(user.expiresAt),
              secure: true,
              sameSite: 'none',
            });
            this.authStore.authenticate();
          },
          ({ error }: HttpErrorResponse) => {
            this.setState({ error: error.title, loginSuccess: false });
          }
        )
      );
    })
  );

  constructor(private authStore: AuthStore, private authService: AuthService) {
    super(initialState);
  }
}

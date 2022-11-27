import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { exhaustMap, Observable } from 'rxjs';
import { AuthStore } from '../auth.store';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, LoginForm } from '../../api.service';

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

  readonly login = this.effect<LoginForm>(
    exhaustMap((loginForm: LoginForm) => {
      this.patchState({ error: '' });
      return this.apiService.login(loginForm).pipe(
        tapResponse(() => {
            this.patchState({ loginSuccess: true });
            this.authStore.authenticate();
          },
          (errResponse: HttpErrorResponse) => {
            if (errResponse.status == 0) {
              this.setState({
                error: 'Unable to reach the server. Please try again later!',
                loginSuccess: false
              });
            } else {
              this.setState({
                error: errResponse.error.title,
                loginSuccess: false,
              });
            }
          }
        )
      );
    })
  );

  constructor(private authStore: AuthStore, private apiService: ApiService) {
    super(initialState);
  }
}
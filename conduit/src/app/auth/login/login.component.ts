import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { LoginStore } from './login.store';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  template: ` <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Sign In</h1>
          <p class="text-xs-center">
            <a [routerLink]="['/register']">Don't have an account?</a>
          </p>

          <ng-template [ngIf]="loginSuccess$ | async">
            <div class="alert alert-success" role="alert">
              Login Successful. Redirecting to home...
            </div>
          </ng-template>

          <ul *ngIf="error$ | async as error" class="error-messages">
            <li>{{ error }}</li>
          </ul>

          <form [formGroup]="loginForm" (ngSubmit)="login()">
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                placeholder="Username or email"
                formControlName="usernameOrEmail"
                [ngStyle]="
                  username?.touched && username?.invalid
                    ? { border: '1px solid red' }
                    : null
                "
              />
              <span
                style="color: red"
                *ngIf="username?.touched && username?.invalid"
                >Username or email is required</span
              >
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="password"
                placeholder="Password"
                formControlName="password"
                [ngStyle]="
                  password?.touched && password?.invalid
                    ? { border: '1px solid red' }
                    : null
                "
              />
              <span
                style="color: red"
                *ngIf="password?.touched && password?.invalid"
                >Password is required</span
              >
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, NgIf, NgStyle, AsyncPipe],
  providers: [LoginStore],
})
export class LoginComponent {
  loginForm: FormGroup = this.fb.nonNullable.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly error$: Observable<string> = this.store.error$;
  readonly loginSuccess$: Observable<boolean> = this.store.loginSuccess$;

  constructor(private fb: FormBuilder, private store: LoginStore) {}

  get username() {
    return this.loginForm.get('usernameOrEmail');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.store.login(this.loginForm.getRawValue());
  }
}

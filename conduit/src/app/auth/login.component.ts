import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLinkWithHref } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  standalone: true,
  template: ` <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Sign In</h1>
          <p class="text-xs-center">
            <a [routerLink]="['/auth/register']">Don't have an account?</a>
          </p>

          <ul class="error-messages">
            <li>Invalid credentials</li>
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
  imports: [RouterLinkWithHref, ReactiveFormsModule, NgIf, NgStyle],
})
export class LoginComponent {
  loginForm: FormGroup = this.fb.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });
  constructor(private fb: FormBuilder, private router: Router) {}

  login() {
    console.log(this.loginForm.getRawValue());
    void this.router.navigate(['/home']);
  }

  get username() {
    return this.loginForm.get('usernameOrEmail');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

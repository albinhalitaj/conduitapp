import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf, NgStyle } from '@angular/common';
import { RegisterStore } from './register.store';
import { Observable } from 'rxjs';
import {
  emailExistsValidator,
  emailValidator,
} from '../../validators/app-validators';
import { ApiService } from '../../api.service';

@Component({
  standalone: true,
  template: ` <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Sign up</h1>
          <p class="text-xs-center">
            <a [routerLink]="['/login']">Have an account?</a>
          </p>

          <ul *ngIf="errors$ | async as errors" class="error-messages">
            <li *ngFor="let error of errors">{{ error }}</li>
          </ul>

          <form [formGroup]="registerForm" (ngSubmit)="register()">
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                formControlName="firstName"
                placeholder="First Name"
                [ngStyle]="
                  firstName?.touched && firstName?.invalid
                    ? { border: '1px solid red' }
                    : null
                "
              />
              <span
                style="color: red"
                *ngIf="firstName?.touched && firstName?.invalid"
                >First name is required</span
              >
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                formControlName="lastName"
                placeholder="Last Name"
                [ngStyle]="
                  lastName?.touched && lastName?.invalid
                    ? { border: '1px solid red' }
                    : null
                "
              />
              <span
                style="color: red"
                *ngIf="lastName?.touched && lastName?.invalid"
                >Last name is required</span
              >
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                formControlName="username"
                placeholder="Username"
                [ngStyle]="
                  username?.touched && username?.invalid
                    ? { border: '1px solid red' }
                    : null
                "
              />
              <span
                style="color: red"
                *ngIf="username?.touched && username?.invalid"
                >Username is required</span
              >
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="email"
                formControlName="email"
                placeholder="Email"
                [ngStyle]="
                  email?.touched && email?.invalid
                    ? { border: '1px solid red' }
                    : null
                "
              />
              <span
                style="color: red"
                *ngIf="email?.touched && email?.hasError('required')"
                >Email is required</span
              >
              <span
                style="color: red"
                *ngIf="email?.touched && email?.hasError('invalidEmail')"
                >Email is invalid</span
              >
              <span
                [ngStyle]="{ color: 'red' }"
                *ngIf="email?.dirty && email?.hasError('emailExists')"
                >Email already exists</span
              >
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="password"
                formControlName="password"
                placeholder="Password"
                [ngStyle]="
                  password?.touched && password?.invalid
                    ? { border: '1px solid red' }
                    : null
                "
              />
              <span
                style="color: red"
                *ngIf="password?.touched && password?.hasError('required')"
                >Password is required</span
              >
              <span
                style="color: red"
                *ngIf="password?.touched && password?.hasError('minlength')"
                >Password must be atleast 8 characters</span
              >
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>`,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgStyle,
    NgIf,
    NgForOf,
    AsyncPipe,
  ],
  providers: [RegisterStore],
})
export class RegisterComponent {
  registerForm: FormGroup = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    email: [
      '',
      [Validators.required, emailValidator()],
      [emailExistsValidator(this.apiService, this.cdr)],
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  errors$: Observable<Array<string> | null> = this.store.errors$;

  constructor(
    private fb: FormBuilder,
    private store: RegisterStore,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
    } else {
      this.store.register(this.registerForm.getRawValue());
    }
  }
}

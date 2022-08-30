import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthStore, User } from '../auth/auth.store';
import { Observable, tap } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="settings-page" *ngIf="user$ | async as user">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            <form [formGroup]="profile">
              <fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    formControlName="image"
                    placeholder="URL of profile picture"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Your Name"
                    formControlName="username"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control form-control-lg"
                    rows="8"
                    placeholder="Short bio about you"
                    formControlName="bio"
                  ></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Email"
                    formControlName="email"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="password"
                    placeholder="Password"
                    formControlName="password"
                  />
                </fieldset>
                <button class="btn btn-lg btn-primary pull-xs-right">
                  Update Settings
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [ReactiveFormsModule, NgIf, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  readonly user$: Observable<User | null> = this.authStore.user$.pipe(
    tap((user) => {
      if (user && !this.isInitialized) {
        this.initForm(user);
      }
    })
  );

  constructor(private fb: FormBuilder, private authStore: AuthStore) {}
  profile: FormGroup = this.fb.nonNullable.group({});

  private isInitialized = false;

  private initForm(currentUser: User) {
    this.profile.addControl('image', this.fb.control(currentUser.image || ''));
    this.profile.addControl(
      'username',
      this.fb.control(currentUser.username, [Validators.required])
    );
    this.profile.addControl('bio', this.fb.control(currentUser.bio || ''));
    this.profile.addControl(
      'email',
      this.fb.control(currentUser.email, [
        Validators.required,
        Validators.email,
      ])
    );
    this.profile.addControl('password', this.fb.control(''));
    this.isInitialized = true;
  }
}

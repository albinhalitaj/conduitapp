import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { Observable, tap } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { SettingsStore } from './settings.store';
import { UpdatedUser } from './settings.service';
import { provideComponentStore } from '@ngrx/component-store';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="settings-page" *ngIf="profile$ | async as user">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            <form [formGroup]="profile" (ngSubmit)="updateUser()">
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
                <button
                  type="submit"
                  class="btn btn-lg btn-primary pull-xs-right"
                >
                  Update Settings
                </button>
              </fieldset>
            </form>
            <hr />
            <button
              (click)="signOut()"
              type="button"
              class="btn btn-outline-danger"
            >
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [ReactiveFormsModule, NgIf, AsyncPipe],
  providers: [provideComponentStore(SettingsStore)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  profile: FormGroup = this.fb.nonNullable.group({});
  private isInitialized = false;

  readonly profile$: Observable<UpdatedUser | null> = this.store.profile$.pipe(
    tap((profile: UpdatedUser | null) => {
      if (profile && !this.isInitialized) {
        this.initForm(profile);
      }
    })
  );

  constructor(
    private store: SettingsStore,
    private fb: FormBuilder,
    private authStore: AuthStore
  ) {}

  signOut() {
    this.authStore.signOut();
  }

  updateUser() {
    this.store.updateUser(this.profile.getRawValue());
  }

  private initForm(currentUser: UpdatedUser) {
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
    this.isInitialized = true;
  }
}

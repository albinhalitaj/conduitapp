import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import {
  SettingsService,
  UpdatedUser,
  UpdateUserForm,
} from './settings.service';
import { Observable, switchMap } from 'rxjs';
import { AuthStore } from '../auth/auth.store';

export interface SettingsState {
  profile: UpdatedUser | null;
}

const initialState: SettingsState = {
  profile: null,
};

@Injectable()
export class SettingsStore
  extends ComponentStore<SettingsState>
  implements OnStateInit
{
  readonly profile$: Observable<UpdatedUser | null> = this.select(
    (s) => s.profile
  );

  updateUser = this.effect<UpdateUserForm>(
    switchMap((user: UpdateUserForm) => {
      return this.settingsService.updateUser(user).pipe(
        tapResponse(
          (updatedUser: UpdatedUser) => {
            this.setState({ profile: updatedUser });
          },
          (error) => console.log(error)
        )
      );
    })
  );

  getUser = this.effect<void>(
    switchMap(() => {
      return this.settingsService.get().pipe(
        tapResponse(
          (user) => {
            const userSettings: UpdatedUser = {
              username: user.username,
              email: user.email,
              bio: user.bio,
              image: user.image,
            };
            this.setState({ profile: userSettings });
          },
          (error) => console.log(error)
        )
      );
    })
  );

  constructor(
    private authStore: AuthStore,
    private settingsService: SettingsService
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getUser();
  }
}

import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { Observable, switchMap } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { ApiService, UpdatedUser, UpdateUserForm } from '../api.service';
import { Router } from '@angular/router';

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
      return this.apiService.updateUser(user).pipe(
        tapResponse(
          (updatedUser: UpdatedUser) => {
            this.setState({ profile: updatedUser });
            void this.router.navigate(['/profile', updatedUser.username]);
          },
          (error) => console.log(error)
        )
      );
    })
  );

  getUser = this.effect<void>(
    switchMap(() => {
      return this.apiService.get().pipe(
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
    private apiService: ApiService,
    private router: Router
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getUser();
  }
}

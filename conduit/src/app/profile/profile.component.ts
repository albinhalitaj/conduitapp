import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Router,
  RouterLinkActive,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { Observable, takeUntil, tap } from 'rxjs';
import {
  AsyncPipe,
  DatePipe,
  NgForOf,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import { Profile, ProfileStore, ProfileVm } from './profile.store';
import { provideComponentStore } from '@ngrx/component-store';
import { AuthStore } from '../auth/auth.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: ` <div *ngIf="vm$ | async as vm" class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <ng-container *ngIf="vm.profile">
            <div class="col-xs-12 col-md-10 offset-md-1">
              <img
                [ngSrc]="
                  !vm.profile.image
                    ? 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                    : vm.profile.image
                "
                width="100"
                height="100"
                class="user-img"
                alt="Avatar"
              />
              <h4>{{ vm.profile.username }}</h4>
              <p>
                {{ vm.profile.bio }}
              </p>
              <button
                *ngIf="vm.user != vm.profile.username; else currentUser"
                (click)="followUser(vm.profile)"
                class="btn btn-sm btn-outline-secondary action-btn"
              >
                <i class="ion-plus-round"></i>
                &nbsp;
                {{ vm.profile.following ? 'Unfollow' : 'Follow' }}
                {{ vm.profile.username }}
              </button>
              <ng-template #currentUser>
                <a
                  [routerLink]="['/settings']"
                  class="btn btn-sm btn-outline-secondary action-btn"
                >
                  <i class="ion-gear-a"></i>
                  &nbsp; Edit Profile Settings
                </a>
              </ng-template>
            </div>
          </ng-container>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLinkActive="active"
                  [routerLink]="['/profile', vm.profile?.username]"
                  [routerLinkActiveOptions]="{ exact: true }"
                  >My Articles</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLinkActive="active"
                  [routerLink]="['/profile', vm.profile?.username, 'favorites']"
                  [routerLinkActiveOptions]="{ exact: true }"
                  >Favorited Articles</a
                >
              </li>
            </ul>
          </div>
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponentStore(ProfileStore)],
  imports: [
    NgIf,
    AsyncPipe,
    NgForOf,
    DatePipe,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    NgOptimizedImage,
  ],
})
export class ProfileComponent {
  readonly vm$: Observable<ProfileVm> = this.store.vm$;

  constructor(
    private router: Router,
    private auth: AuthStore,
    private store: ProfileStore
  ) {}

  followUser(profile: Profile) {
    this.auth.isAuthenticated$
      .pipe(
        tap((isAuthenticated: boolean) => {
          if (isAuthenticated) this.store.followUser(profile);
          void this.router.navigate(['/login']);
        }),
        takeUntil(this.store.destroy$)
      )
      .subscribe();
  }
}

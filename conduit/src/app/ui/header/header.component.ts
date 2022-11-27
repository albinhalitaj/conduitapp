import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthStore, User } from '../../auth/auth.store';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  template: ` <nav class="navbar navbar-light">
    <div class="container">
      <a class="navbar-brand" [routerLink]="['/']">conduit</a>
      <ul class="nav navbar-nav pull-xs-right">
        <li class="nav-item">
          <a
            [routerLink]="['/']"
            [routerLinkActiveOptions]="{ exact: true }"
            [routerLinkActive]="'active'"
            class="nav-link"
            >Home</a
          >
        </li>
        <ng-container *ngIf="isAuthenticated$ | async; else notAuthenticated">
          <li class="nav-item">
            <a
              class="nav-link"
              [routerLinkActive]="'active'"
              [routerLink]="['/editor']"
            >
              <i class="ion-compose"></i>&nbsp;New Article
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              [routerLink]="['/settings']"
              [routerLinkActive]="'active'"
            >
              <i class="ion-gear-a"></i>&nbsp;Settings
            </a>
          </li>
          <ng-container *ngIf="user$ | async as user">
            <li class="nav-item">
              <a
                class="nav-link"
                [routerLink]="['/profile', user.Username]"
                style="user-select: none;"
              >
                {{ user.Username }}
              </a>
            </li>
          </ng-container>
        </ng-container>
        <ng-template #notAuthenticated>
          <li class="nav-item">
            <a
              class="nav-link"
              [routerLinkActive]="'active'"
              [routerLink]="['/login']"
              >Sign in</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              [routerLinkActive]="'active'"
              [routerLink]="['/register']"
              >Sign up</a
            >
          </li>
        </ng-template>
      </ul>
    </div>
  </nav>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLinkWithHref, RouterLinkActive, AsyncPipe, NgIf],
})
export class HeaderComponent {
  readonly isAuthenticated$: Observable<boolean> = this.store.isAuthenticated$;
  readonly user$: Observable<User | null> = this.store.user$;

  constructor(private store: AuthStore) {}
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthStore } from '../../auth/auth.store';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  template: ` <nav class="navbar navbar-light">
    <div class="container">
      <a class="navbar-brand" [routerLink]="['/']">conduit</a>
      <ul class="nav navbar-nav pull-xs-right">
        <ng-container *ngIf="isAuthenticated$ | async; else notAuthenticated">
          <li class="nav-item">
            <a
              class="nav-link"
              [routerLinkActive]="'active'"
              [routerLink]="['/']"
              >Home</a
            >
          </li>
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
              [routerLinkActive]="'active'"
              [routerLink]="['/settings']"
            >
              <i class="ion-gear-a"></i>&nbsp;Settings
            </a>
          </li>
        </ng-container>
        <ng-template #notAuthenticated>
          <li class="nav-item">
            <a class="nav-link" [routerLink]="['/auth/login']">Sign in</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [routerLink]="['/auth/register']">Sign up</a>
          </li>
        </ng-template>
      </ul>
    </div>
  </nav>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLinkWithHref, RouterLinkActive, AsyncPipe, NgIf],
})
export class HeaderComponent {
  readonly isAuthenticated$: Observable<boolean> =
    this.authStore.isAuthenticated$;

  constructor(private authStore: AuthStore) {}
}

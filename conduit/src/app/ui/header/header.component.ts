import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  template: ` <nav class="navbar navbar-light">
    <div class="container">
      <a class="navbar-brand" [routerLink]="['/']">conduit</a>
      <ul class="nav navbar-nav pull-xs-right">
        <li class="nav-item">
          <!-- Add "active" class when you're on that page" -->
          <a class="nav-link active" href="">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="">
            <i class="ion-compose"></i>&nbsp;New Article
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="">
            <i class="ion-gear-a"></i>&nbsp;Settings
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="">Sign in</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="">Sign up</a>
        </li>
      </ul>
    </div>
  </nav>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLinkWithHref],
})
export class HeaderComponent {}

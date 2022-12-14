import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: ` <footer>
    <div class="container">
      <a [routerLink]="['/']" class="logo-font">conduit</a>
      <span class="attribution">
        An interactive learning project from
        <a target="_blank" href="https://thinkster.io">Thinkster</a>. Code &amp;
        design licensed under MIT.
      </span>
    </div>
  </footer>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class FooterComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `<footer>
    <div class="container">
      <a href="/" class="logo-font">conduit</a>
      <span class="attribution">
        An interactive learning project from
        <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed
        under MIT.
      </span>
    </div>
  </footer>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}

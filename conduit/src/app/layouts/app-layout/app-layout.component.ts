import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../ui/footer/footer.component';
import { HeaderComponent } from '../../ui/header/header.component';

@Component({
  standalone: true,
  template: ` <div>
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  </div>`,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
})
export class AppLayoutComponent {}

import { Component, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterModule],
})
export class App {
  static bootstrap() {
    bootstrapApplication(this, {
      providers: [
        importProvidersFrom(RouterModule.forRoot(routes), HttpClientModule),
      ],
    }).catch((err) => console.log(err));
  }
}

import { Component, importProvidersFrom, InjectionToken } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const API_URL = new InjectionToken('API_URL');

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
        importProvidersFrom(
          RouterModule.forRoot(routes, { useHash: true }),
          HttpClientModule
        ),
        {
          provide: API_URL,
          useValue: environment.api_base,
        },
      ],
    }).catch((err) => console.log(err));
  }
}

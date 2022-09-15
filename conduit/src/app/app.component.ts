import {
  Component,
  importProvidersFrom,
  InjectionToken,
  OnInit,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule, TitleStrategy } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { AuthStore } from './auth/auth.store';
import { HttpCookieInterceptor } from './interceptors/http.interceptor';
import { TemplatePageTitleStrategy } from './utils/templatepagetitle';

export const API_URL = new InjectionToken('API_URL');

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterModule],
})
export class App implements OnInit {
  constructor(private authStore: AuthStore) {}

  static bootstrap() {
    bootstrapApplication(this, {
      providers: [
        importProvidersFrom(
          RouterModule.forRoot(routes, {
            useHash: true,
            paramsInheritanceStrategy: 'always',
          }),
          HttpClientModule
        ),
        {
          provide: API_URL,
          useValue: environment.api_base,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpCookieInterceptor,
          multi: true,
        },
        {
          provide: TitleStrategy,
          useClass: TemplatePageTitleStrategy,
        },
      ],
    }).catch((err) => console.log(err));
  }

  ngOnInit(): void {
    this.authStore.init();
  }
}

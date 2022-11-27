import {
  Component,
  importProvidersFrom,
  InjectionToken,
  OnDestroy,
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
import { SignalrService } from './services/signalr.service';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

export const API_URL = new InjectionToken('API_URL');
export const SIGNALR_URL = new InjectionToken('SIGNALR');

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterModule, NgIf, AsyncPipe, JsonPipe],
})
export class App implements OnInit, OnDestroy {
  constructor(
    private authStore: AuthStore,
    public signalrService: SignalrService
  ) {}

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
          provide: SIGNALR_URL,
          useValue: environment.signalr_url,
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
    this.signalrService.startConnection();
    this.authStore.init();
  }

  ngOnDestroy() {
    this.signalrService.closeConnection();
  }
}
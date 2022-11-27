import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  Routes,
  UrlTree,
} from '@angular/router';
import { inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { AuthStore } from '../../auth/auth.store';
import { map, Observable } from 'rxjs';

export const articleType = new InjectionToken<string>('Article Type');

export function provideArticleType(type: string): Provider {
  return {
    provide: articleType,
    useValue: type,
  };
}

@Injectable({ providedIn: 'root' })
class ProfileTitle implements Resolve<string> {
  resolve(route: ActivatedRouteSnapshot) {
    return `@${route.params['username']}`;
  }
}

const nonAuthGuard: () => Observable<UrlTree | boolean> = () => {
  return inject(AuthStore).isAuthenticated$.pipe(
    map((isAuthenticated: boolean) => {
      if (isAuthenticated) return inject(Router).parseUrl('/');
      return true;
    })
  );
};

const authGuard: () => Observable<boolean | UrlTree> = () => {
  return inject(AuthStore).isAuthenticated$.pipe(
    map((isAuthenticated: boolean) => {
      if (isAuthenticated) return isAuthenticated;
      return inject(Router).parseUrl('/');
    })
  );
};

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    loadComponent: () =>
      import('../../home/home.component').then((l) => l.HomeComponent),
  },
  {
    path: 'login',
    title: 'Sign in',
    canMatch: [nonAuthGuard],
    loadComponent: () =>
      import('../../auth/login/login.component').then((l) => l.LoginComponent),
  },
  {
    path: 'register',
    title: 'Register',
    canMatch: [nonAuthGuard],
    loadComponent: () =>
      import('../../auth/register/register.component').then(
        (r) => r.RegisterComponent
      ),
  },
  {
    path: 'settings',
    title: 'Settings',
    canMatch: [authGuard],
    loadComponent: () =>
      import('../../settings/settings.component').then(
        (r) => r.SettingsComponent
      ),
  },
  {
    path: 'article/:slug',
    loadComponent: () =>
      import('../../article/article.component').then((a) => a.ArticleComponent),
  },
  {
    path: 'editor',
    title: 'Editor',
    canMatch: [authGuard],
    loadComponent: () =>
      import('../../editor/editor.component').then((a) => a.EditorComponent),
  },
  {
    path: 'editor/:slug',
    canMatch: [authGuard],
    loadComponent: () =>
      import('../../editor/edit-article/edit-article.component').then(
        (a) => a.EditArticleComponent
      ),
  },
  {
    path: 'profile/:username',
    title: ProfileTitle,
    loadComponent: () =>
      import('../../profile/profile.component').then((r) => r.ProfileComponent),
    loadChildren: () =>
      import('../../profile/profile.routes').then((r) => r.routes),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

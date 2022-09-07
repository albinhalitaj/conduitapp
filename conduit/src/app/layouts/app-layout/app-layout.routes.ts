import { Routes } from '@angular/router';
import { InjectionToken, Provider } from '@angular/core';
import { AuthGuard } from '../../guards/auth.guard';
import { NonAuthGuard } from '../../guards/nonauth.guard';

export const articleType = new InjectionToken<string>('Article Type');

export function provideArticleType(type: string): Provider {
  return {
    provide: articleType,
    useValue: type,
  };
}

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../home/home.component').then((l) => l.HomeComponent),
  },
  {
    path: 'login',
    canLoad: [NonAuthGuard],
    canActivate: [NonAuthGuard],
    loadComponent: () =>
      import('../../auth/login/login.component').then((l) => l.LoginComponent),
  },
  {
    path: 'register',
    canLoad: [NonAuthGuard],
    canActivate: [NonAuthGuard],
    loadComponent: () =>
      import('../../auth/register/register.component').then(
        (r) => r.RegisterComponent
      ),
  },
  {
    path: 'settings',
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
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
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../editor/editor.component').then((a) => a.EditorComponent),
  },
  {
    path: 'editor/:slug',
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../../editor/edit-article/edit-article.component').then(
        (a) => a.EditArticleComponent
      ),
  },
  {
    path: 'profile/:username',
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

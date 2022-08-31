import { Routes, UrlSegment } from '@angular/router';
import { ProfileComponent } from '../../profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../home/home.component').then((l) => l.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../../auth/login/login.component').then((l) => l.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../../auth/register/register.component').then(
        (r) => r.RegisterComponent
      ),
  },
  {
    matcher: (url: UrlSegment[]) => {
      if (url.length >= 1 && url[0].path[0] == '@') {
        return {
          consumed: url,
          posParams: {
            username: new UrlSegment(url[0].path.substring(1), {}),
          },
        };
      }
      return null;
    },
    loadComponent: () =>
      import('../../profile/profile.component').then((r) => r.ProfileComponent),
  },
  {
    path: 'settings',
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
    loadComponent: () =>
      import('../../editor/editor.component').then((a) => a.EditorComponent),
  },
];

import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('../../home/home.component').then((l) => l.HomeComponent),
  },
  {
    path: 'profile/:username',
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

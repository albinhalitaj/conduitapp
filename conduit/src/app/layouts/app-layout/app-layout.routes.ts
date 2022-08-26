import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: 'home',
    loadComponent: () =>
      import('../../auth/login.component').then((l) => l.LoginComponent),
  },
  {
    path: 'articles',
    loadComponent: () =>
      import('../../auth/register.component').then((r) => r.RegisterComponent),
  },
];

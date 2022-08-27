import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('../../auth/login.component').then((l) => l.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../../auth/reigster/register.component').then(
        (r) => r.RegisterComponent
      ),
  },
];

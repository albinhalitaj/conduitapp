import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../app/layouts/app-layout/app-layout.component').then(
        (c) => c.AppLayoutComponent
      ),
    loadChildren: () =>
      import('../app/layouts/app-layout/app-layout.routes').then(
        (r) => r.routes
      ),
  },
];

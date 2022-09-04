import { Routes } from '@angular/router';
import { provideArticleType } from '../layouts/app-layout/app-layout.routes';

export const routes: Routes = [
  {
    path: '',
    providers: [provideArticleType('articles')],
    loadComponent: () =>
      import('../ui/article-list/article-list.component').then(
        (a) => a.ArticleListComponent
      ),
  },
  {
    path: 'favorites',
    providers: [provideArticleType('favorites')],
    loadComponent: () =>
      import('../ui/article-list/article-list.component').then(
        (a) => a.ArticleListComponent
      ),
  },
];

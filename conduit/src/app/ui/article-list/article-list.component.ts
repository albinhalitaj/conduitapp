import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLinkWithHref } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { provideComponentStore } from '@ngrx/component-store';
import { ArticleListState, ArticleListStore } from './article-list.store';
import { Observable } from 'rxjs';
import { AuthStore } from '../../auth/auth.store';
import { Article } from '../../home/home.store';
import { SingleArticleComponent } from './article/single-article.component';

@Component({
  selector: 'app-article-list',
  standalone: true,
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ng-container *ngIf="!vm.loading; else loading">
        <app-article
          [articles]="vm.articles"
          (toggleFavorite)="toggleFavorite($event)"
        >
        </app-article>
      </ng-container>
    </ng-container>

    <ng-template #noArticles>
      <p class="article-preview">No articles here yet.</p>
    </ng-template>

    <ng-template #loading>
      <p class="article-preview">Loading...</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponentStore(ArticleListStore)],
  imports: [
    RouterLinkWithHref,
    NgForOf,
    DatePipe,
    NgIf,
    AsyncPipe,
    NgClass,
    SingleArticleComponent,
  ],
})
export class ArticleListComponent {
  vm$: Observable<ArticleListState> = this.store.vm$;

  constructor(
    private router: Router,
    private store: ArticleListStore,
    private authStore: AuthStore
  ) {}

  toggleFavorite(article: Article) {
    if (this.authStore.isAuthenticated) {
      this.store.toggleFavorite(article);
    } else {
      void this.router.navigate(['/login']);
    }
  }
}

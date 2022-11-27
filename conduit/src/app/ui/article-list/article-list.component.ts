import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { provideComponentStore } from '@ngrx/component-store';
import { ArticleListState, ArticleListStore } from './article-list.store';
import { Observable, takeUntil, tap } from 'rxjs';
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
          *ngIf="!vm.error"
          [articles]="vm.articles"
          (toggleFavorite)="toggleFavorite($event)"
        >
        </app-article>
      </ng-container>
      <p *ngIf="vm.error" class="article-preview">{{ vm.error }}</p>
    </ng-container>

    <ng-template #loading>
      <p class="article-preview">Loading...</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponentStore(ArticleListStore)],
  imports: [
    RouterLink,
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
    this.authStore.isAuthenticated$
      .pipe(
        tap((isAuthenticated: boolean) => {
          if (isAuthenticated) this.store.toggleFavorite(article);
          void this.router.navigate(['/login']);
        }),
        takeUntil(this.store.destroy$)
      )
      .subscribe();
  }
}

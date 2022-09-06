import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLinkWithHref } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { provideComponentStore } from '@ngrx/component-store';
import { ArticleListState, ArticleListStore } from './article-list.store';
import { Observable } from 'rxjs';
import { AuthStore } from '../../auth/auth.store';
import { Article } from '../../home/home.store';

@Component({
  selector: 'app-article-list',
  standalone: true,
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ng-container *ngIf="!vm.loading; else loading">
        <ng-container *ngIf="vm.articles.length > 0; else noArticles">
          <div *ngFor="let article of vm.articles" class="article-preview">
            <div class="article-meta">
              <a [routerLink]="['/profile', article.author.username]"
                ><img
                  [src]="
                    article.author.image
                      ? article.author.image
                      : 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                  "
                  alt="Avatar"
              /></a>
              <div class="info">
                <a
                  [routerLink]="['/profile', article.author.username]"
                  class="author"
                  >{{ article.author.username }}</a
                >
                <span class="date">{{
                  article.createdAt | date: 'longDate'
                }}</span>
              </div>
              <button
                [ngClass]="{
                  'btn-outline-primary': !article.isFavorited,
                  'btn-primary': article.isFavorited
                }"
                (click)="toggleFavorite(article)"
                class="btn btn-sm pull-xs-right"
              >
                <i class="ion-heart"></i> {{ article.favoritesCount }}
              </button>
            </div>
            <a [routerLink]="['/article', article.slug]" class="preview-link">
              <h1>{{ article.title }}</h1>
              <p>{{ article.description }}</p>
              <span>Read more...</span>
            </a>
          </div>
        </ng-container>
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
  imports: [RouterLinkWithHref, NgForOf, DatePipe, NgIf, AsyncPipe, NgClass],
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

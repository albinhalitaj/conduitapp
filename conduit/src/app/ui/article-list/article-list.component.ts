import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { provideComponentStore } from '@ngrx/component-store';
import { ArticleListStore } from './article-list.store';
import { Article } from '../../home/home.store';

@Component({
  selector: 'app-article-list',
  standalone: true,
  template: `
    <ng-container *ngIf="articles$ | async as articles; else noArticles">
      <div *ngFor="let article of articles" class="article-preview">
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
            <span class="date">{{ article.createdAt | date: 'longDate' }}</span>
          </div>
          <button
            [ngClass]="{
              'btn-outline-primary': !article.isFavorited,
              'btn-primary': article.isFavorited
            }"
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

    <ng-template #noArticles>
      <p class="article-preview">No articles here yet.</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponentStore(ArticleListStore)],
  imports: [RouterLinkWithHref, NgForOf, DatePipe, NgIf, AsyncPipe, NgClass],
})
export class ArticleListComponent {
  articles$: Observable<Article[]> = this.store.articles$;

  constructor(private store: ArticleListStore) {}
}

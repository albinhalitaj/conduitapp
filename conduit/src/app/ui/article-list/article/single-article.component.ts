import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { Article } from '../../../home/home.store';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-article',
  standalone: true,
  template: `
    <ng-container *ngIf="articles.length > 0; else noArticles">
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
            (click)="toggleFavorite.emit(article)"
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
      <div class="article-preview">No articles are here... yet.</div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
  imports: [RouterLinkWithHref, NgIf, NgForOf, DatePipe, NgClass],
})
export class SingleArticleComponent {
  @Input() articles!: Article[];

  @Output() toggleFavorite = new EventEmitter<Article>();
}

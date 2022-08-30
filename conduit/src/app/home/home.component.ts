import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Article, HomeStore } from './home.store';
import { provideComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-page">
      <div class="banner">
        <div class="container">
          <h1 class="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div class="container page">
        <div class="row">
          <ng-container *ngIf="articles$ | async as articles">
            <div class="col-md-9">
              <div class="feed-toggle">
                <ul class="nav nav-pills outline-active">
                  <li class="nav-item">
                    <a class="nav-link disabled" href="">Your Feed</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link active" href="">Global Feed</a>
                  </li>
                </ul>
              </div>

              <div *ngFor="let article of articles" class="article-preview">
                <div class="article-meta">
                  <a [routerLink]="['/profile', article.author.username]"
                    ><img [src]="article.author.image" alt="Avatar"
                  /></a>
                  <div class="info">
                    <a href="" class="author">{{ article.author.username }}</a>
                    <span class="date">{{ article.createdAt }}</span>
                  </div>
                  <button class="btn btn-outline-primary btn-sm pull-xs-right">
                    <i class="ion-heart"></i> {{ article.favoritesCount }}
                  </button>
                </div>
                <a href="" class="preview-link">
                  <h1>{{ article.title }}</h1>
                  <p>{{ article.description }}</p>
                  <span>Read more...</span>
                </a>
              </div>
            </div>
          </ng-container>

          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              <div *ngIf="tags$ | async as tags" class="tag-list">
                <a
                  *ngFor="let tag of tags"
                  (click)="getArticleByTag(tag)"
                  class="tag-pill tag-default"
                  >{{ tag }}</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  providers: [provideComponentStore(HomeStore)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, NgForOf, RouterLinkWithHref],
})
export class HomeComponent {
  constructor(private store: HomeStore) {}

  readonly articles$: Observable<Article[]> = this.store.articles$;
  readonly tags$: Observable<string[]> = this.store.tags$;

  getArticleByTag(tag: string) {
    this.store.getArticleByTags(tag);
  }
}

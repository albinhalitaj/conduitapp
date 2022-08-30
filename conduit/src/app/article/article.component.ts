import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideComponentStore } from '@ngrx/component-store';
import { ArticleStore } from './article.store';
import { map, Observable } from 'rxjs';
import { Article } from '../home/home.store';
import { AsyncPipe, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { RouterLinkWithHref } from '@angular/router';
import { Comment } from './article.service';
import { AuthStore } from '../auth/auth.store';

@Component({
  selector: 'app-article',
  standalone: true,
  template: `
    <ng-container *ngIf="article$ | async as article">
      <div class="article-page">
        <div class="banner">
          <div class="container">
            <h1>{{ article.title }}</h1>

            <div class="article-meta">
              <a href=""><img [src]="article.author.image" alt="Avatar" /></a>
              <div class="info">
                <a
                  [routerLink]="['/profile/', article.author.username]"
                  class="author"
                  >{{ article.author.username }}</a
                >
                <span class="date">{{ article.createdAt }}</span>
              </div>
              <button class="btn btn-sm btn-outline-secondary">
                <i class="ion-plus-round"></i>
                &nbsp; Follow {{ article.author.username }}
                <span class="counter">(10)</span>
              </button>
              &nbsp;&nbsp;
              <button class="btn btn-sm btn-outline-primary">
                <i class="ion-heart"></i>
                &nbsp; Favorite Post
                <span class="counter">({{ article.favoritesCount }})</span>
              </button>
            </div>
          </div>
        </div>

        <div class="container page">
          <div class="row article-content">
            <div class="col-md-12">
              <div [innerHTML]="article.body"></div>
            </div>
          </div>

          <hr />

          <div class="article-actions">
            <div class="article-meta">
              <a [routerLink]="['/profile/', article.author.username]"
                ><img [src]="article.author.image" alt="Avatar"
              /></a>
              <div class="info">
                <a
                  [routerLink]="['/profile/', article.author.username]"
                  class="author"
                  >{{ article.author.username }}</a
                >
                <span class="date">{{ article.createdAt }}</span>
              </div>

              <button class="btn btn-sm btn-outline-secondary">
                <i class="ion-plus-round"></i>
                &nbsp; Follow {{ article.author.username }}
              </button>
              &nbsp;
              <button class="btn btn-sm btn-outline-primary">
                <i class="ion-heart"></i>
                &nbsp; Favorite Post
                <span class="counter">({{ article.favoritesCount }})</span>
              </button>
            </div>
          </div>

          <ng-container *ngIf="user$ | async as user">
            <div class="row">
              <div class="col-xs-12 col-md-8 offset-md-2">
                <form class="card comment-form">
                  <div class="card-block">
                    <textarea
                      class="form-control"
                      placeholder="Write a comment..."
                      rows="3"
                    ></textarea>
                  </div>
                  <div class="card-footer">
                    <img
                      [src]="user.image"
                      alt="Avatar"
                      class="comment-author-img"
                    />
                    <button class="btn btn-sm btn-primary">Post Comment</button>
                  </div>
                </form>

                <ng-container *ngIf="comments$ | async as comments">
                  <div *ngFor="let comment of comments" class="card">
                    <div class="card-block">
                      <p class="card-text">
                        {{ comment.body }}
                      </p>
                    </div>
                    <div class="card-footer">
                      <a class="comment-author">
                        <img
                          [src]="comment.author.image"
                          alt="Avatar"
                          class="comment-author-img"
                        />
                      </a>
                      &nbsp;
                      <a href="" class="comment-author">{{
                        comment.author.username
                      }}</a>
                      <span class="date-posted">{{ comment.createdAt }}</span>
                      <span
                        *ngIf="user.username == comment.author.username"
                        class="mod-options"
                      >
                        <i class="ion-edit"></i>
                        <i class="ion-trash-a"></i>
                      </span>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </ng-container>
  `,
  providers: [provideComponentStore(ArticleStore)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, NgOptimizedImage, RouterLinkWithHref, NgForOf],
})
export class ArticleComponent {
  readonly article$: Observable<Article | null> = this.store.article$;
  readonly comments$: Observable<Comment[]> = this.store.comments$;
  readonly user$: Observable<{ username: string; image: string } | null> =
    this.userStore.user$.pipe(
      map((user) => {
        if (user) {
          return {
            username: user?.username,
            image: user?.image,
          };
        }
        return null;
      })
    );

  constructor(private store: ArticleStore, private userStore: AuthStore) {}
}

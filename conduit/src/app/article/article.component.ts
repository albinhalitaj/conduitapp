import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideComponentStore } from '@ngrx/component-store';
import { ArticleStore, ArticleVm } from './article.store';
import { Observable } from 'rxjs';
import {
  AsyncPipe,
  DatePipe,
  NgForOf,
  NgIf,
  NgOptimizedImage,
} from '@angular/common';
import { RouterLinkWithHref } from '@angular/router';
import { AuthStore, User } from '../auth/auth.store';

@Component({
  selector: 'app-article',
  standalone: true,
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ng-container *ngIf="vm.article">
        <div class="article-page">
          <div class="banner">
            <div class="container">
              <h1>{{ vm.article.title }}</h1>

              <div class="article-meta">
                <a href=""
                  ><img [src]="vm.article.author.image" alt="Avatar"
                /></a>
                <div class="info">
                  <a
                    [routerLink]="['/profile/', vm.article.author.username]"
                    class="author"
                    >{{ vm.article.author.username }}</a
                  >
                  <span class="date">{{
                    vm.article.createdAt | date: 'longDate'
                  }}</span>
                </div>
                <ng-container *ngIf="!vm.isOwner">
                  <button class="btn btn-sm btn-outline-secondary">
                    <i class="ion-plus-round"></i>
                    &nbsp; Follow {{ vm.article.author.username }}
                    <span class="counter">(10)</span>
                  </button>
                  &nbsp;&nbsp;
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="ion-heart"></i>
                    &nbsp; Favorite Post
                    <span class="counter"
                      >({{ vm.article.favoritesCount }})</span
                    >
                  </button>
                </ng-container>
              </div>
            </div>
          </div>

          <div class="container page">
            <div class="row article-content">
              <div class="col-md-12">
                <div [innerHTML]="vm.article.body"></div>
              </div>
            </div>

            <ul class="tag-list">
              <li
                *ngFor="let tag of vm.article.tags"
                class="tag-default tag-pill tag-outline ng-binding ng-scope"
              >
                {{ tag }}
              </li>
            </ul>
            <hr />

            <div class="article-actions">
              <div class="article-meta">
                <a [routerLink]="['/profile/', vm.article.author.username]"
                  ><img [src]="vm.article.author.image" alt="Avatar"
                /></a>
                <div class="info">
                  <a
                    [routerLink]="['/', '@' + vm.article.author.username]"
                    class="author"
                    >{{ vm.article.author.username }}</a
                  >
                  <span class="date">{{
                    vm.article.createdAt | date: 'longDate'
                  }}</span>
                </div>

                <ng-container *ngIf="!vm.isOwner">
                  <button class="btn btn-sm btn-outline-secondary">
                    <i class="ion-plus-round"></i>
                    &nbsp; Follow {{ vm.article.author.username }}
                  </button>
                  &nbsp;
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="ion-heart"></i>
                    &nbsp; Favorite Post
                    <span class="counter"
                      >({{ vm.article.favoritesCount }})</span
                    >
                  </button>
                </ng-container>
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
                        [src]="
                          user.image == ''
                            ? 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                            : user.image
                        "
                        alt="Avatar"
                        class="comment-author-img"
                      />
                      <button class="btn btn-sm btn-primary">
                        Post Comment
                      </button>
                    </div>
                  </form>

                  <ng-container *ngIf="vm.comments as comments">
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
                        <span class="date-posted">{{
                          comment.createdAt | date: 'longDate'
                        }}</span>
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
    </ng-container>
  `,
  providers: [provideComponentStore(ArticleStore)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    NgOptimizedImage,
    RouterLinkWithHref,
    NgForOf,
    DatePipe,
  ],
})
export class ArticleComponent {
  readonly vm$: Observable<ArticleVm> = this.store.vm$;
  readonly user$: Observable<User | null> = this.authStore.user$;

  constructor(private store: ArticleStore, private authStore: AuthStore) {}
}

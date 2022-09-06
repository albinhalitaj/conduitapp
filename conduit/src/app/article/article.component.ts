import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideComponentStore } from '@ngrx/component-store';
import { ArticleStore, ArticleVm } from './article.store';
import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLinkWithHref } from '@angular/router';
import { CommentComponent } from '../ui/comment/comment.component';
import { CommentFormComponent } from '../ui/comment/comment-form.component';
import { UserActionsComponent } from '../ui/user-actions/user-actions.component';
import { SanitizerPipe } from '../pipes/sanitizer.pipe';
import { AuthStore } from '../auth/auth.store';

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
                <a [routerLink]="['/profile', vm.article.author.username]"
                  ><img
                    [src]="
                      vm.article.author.image
                        ? vm.article.author.image
                        : 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                    "
                    alt="Avatar"
                /></a>
                <div class="info">
                  <a
                    [routerLink]="['/profile', vm.article.author.username]"
                    class="author"
                    >{{ vm.article.author.username }}</a
                  >
                  <span class="date">{{
                    vm.article.createdAt | date: 'longDate'
                  }}</span>
                </div>
                <app-user-actions
                  *ngIf="!vm.isOwner"
                  [favoritesCount]="vm.article.favoritesCount"
                  [isFavorited]="vm.article.isFavorited"
                  [author]="vm.article.author"
                  (followUser)="followUser($event)"
                  (favoriteArticle)="favoriteArticle(vm.article.slug)"
                >
                </app-user-actions>
              </div>
            </div>
          </div>

          <div class="container page">
            <div class="row article-content">
              <div class="col-md-12">
                <div [innerHTML]="vm.article.body | sanitizeHtml"></div>
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
                <a [routerLink]="['/profile', vm.article.author.username]"
                  ><img
                    [src]="
                      vm.article.author.image
                        ? vm.article.author.image
                        : 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                    "
                    alt="Avatar"
                /></a>
                <div class="info">
                  <a
                    [routerLink]="['/profile', vm.article.author.username]"
                    class="author"
                    >{{ vm.article.author.username }}</a
                  >
                  <span class="date">{{
                    vm.article.createdAt | date: 'longDate'
                  }}</span>
                </div>

                <app-user-actions
                  *ngIf="!vm.isOwner"
                  [favoritesCount]="vm.article.favoritesCount"
                  [isFavorited]="vm.article.isFavorited"
                  [author]="vm.article.author"
                  (followUser)="followUser($event)"
                  (favoriteArticle)="favoriteArticle(vm.article.slug)"
                >
                </app-user-actions>
              </div>
            </div>

            <div class="row">
              <div class="col-xs-12 col-md-8 offset-md-2">
                <app-comment-form
                  *ngIf="vm.user"
                  (postComment)="postComment($event)"
                  [image]="vm.user.image"
                >
                </app-comment-form>

                <app-comment
                  [comments]="vm.comments"
                  [username]="vm.user?.username"
                  (deleteComment)="deleteComment($event, vm.article.slug)"
                ></app-comment>
              </div>
            </div>
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
    RouterLinkWithHref,
    NgForOf,
    DatePipe,
    CommentComponent,
    CommentFormComponent,
    UserActionsComponent,
    SanitizerPipe,
  ],
})
export class ArticleComponent {
  readonly vm$: Observable<ArticleVm> = this.store.vm$;

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private store: ArticleStore
  ) {}

  followUser(username: string) {
    if (!this.authStore.isAuthenticated) {
      void this.router.navigate(['/login']);
    } else {
      console.log('Following ', username);
    }
  }

  favoriteArticle(slug: string) {
    if (!this.authStore.isAuthenticated) {
      void this.router.navigate(['/login']);
    } else {
      console.log('Favorite ', slug);
    }
  }

  postComment(body: string) {
    this.store.postComment(body);
  }

  deleteComment(commentId: string, slug: string) {
    this.store.deleteComment({ commentId, slug });
  }
}

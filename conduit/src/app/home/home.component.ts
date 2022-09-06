import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Article, HomeStore, HomeVm } from './home.store';
import { provideComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLinkWithHref } from '@angular/router';
import Cookies from 'js-cookie';
import { SingleArticleComponent } from '../ui/article-list/article/single-article.component';
import { AuthStore } from '../auth/auth.store';

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

      <ng-container *ngIf="vm$ | async as vm">
        <div class="container page">
          <div class="row">
            <div class="col-md-9">
              <div class="feed-toggle">
                <ul class="nav nav-pills outline-active">
                  <li class="nav-item" *ngIf="vm.isAuthenticated">
                    <a
                      class="nav-link"
                      [class.active]="isFeedActive"
                      (click)="getFeed()"
                      >Your Feed</a
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      (click)="getGlobal()"
                      [class.active]="isGlobalActive"
                      >Global Feed</a
                    >
                  </li>
                  <li class="nav-item" *ngIf="getByTags">
                    <a class="nav-link" [class.active]="getByTags"
                      ># {{ selectedTag }}</a
                    >
                  </li>
                </ul>
              </div>
              <ng-container *ngIf="!vm.isLoading; else loading">
                <app-article
                  [articles]="vm.articles"
                  (toggleFavorite)="toggleFavorite($event)"
                ></app-article>
              </ng-container>
              <ng-template #loading>
                <div class="article-preview">Loading...</div>
              </ng-template>
            </div>

            <div class="col-md-3">
              <div class="sidebar">
                <p>Popular Tags</p>

                <div *ngIf="!vm.isLoading; else loading" class="tag-list">
                  <ng-container *ngIf="vm.tags.length; else noTags">
                    <a
                      *ngFor="let tag of vm.tags"
                      (click)="getArticleByTag(tag)"
                      class="tag-default tag-pill"
                      >{{ tag }}</a
                    >
                  </ng-container>
                  <ng-template #noTags>
                    <p>No tags.</p>
                  </ng-template>
                  <ng-template #loading>
                    <p>Loading...</p>
                  </ng-template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  providers: [provideComponentStore(HomeStore)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    NgForOf,
    RouterLinkWithHref,
    DatePipe,
    NgClass,
    SingleArticleComponent,
  ],
  styles: [
    `
      .tag-default:hover {
        cursor: pointer;
        background-color: #687077;
      }

      .nav-link {
        cursor: pointer;
      }
    `,
  ],
})
export class HomeComponent {
  readonly vm$: Observable<HomeVm> = this.store.vm$;
  selectedTag: string = '';
  isGlobalActive: boolean = false;
  isFeedActive: boolean = false;
  getByTags: boolean = false;

  constructor(
    private store: HomeStore,
    private authStore: AuthStore,
    private router: Router
  ) {
    const user = Cookies.get('user');
    if (!user) {
      this.isGlobalActive = true;
    } else {
      this.isFeedActive = true;
    }
  }

  getArticleByTag(tag: string) {
    this.selectedTag = tag;
    this.getByTags = true;
    this.isGlobalActive = false;
    this.isFeedActive = false;
    this.store.getArticleByTags(tag);
  }

  getFeed() {
    this.isFeedActive = true;
    this.isGlobalActive = false;
    this.getByTags = false;
    this.store.getFeed();
  }

  getGlobal() {
    this.isFeedActive = false;
    this.isGlobalActive = true;
    this.getByTags = false;
    this.store.getArticles();
  }

  toggleFavorite(article: Article) {
    if (!this.authStore.isAuthenticated) {
      void this.router.navigate(['/login']);
    } else {
      console.log('favorite', article.slug);
    }
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Article, HomeStore, HomeVm } from './home.store';
import { provideComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLinkWithHref } from '@angular/router';
import { SingleArticleComponent } from '../ui/article-list/article/single-article.component';
import { AuthStore } from '../auth/auth.store';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <div class="home-page">
        <div *ngIf="!vm.isAuthenticated" class="banner">
          <div class="container">
            <h1 class="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>

        <div class="container page">
          <div class="row">
            <div class="col-md-9">
              <div class="feed-toggle">
                <ul class="nav nav-pills outline-active">
                  <li class="nav-item" *ngIf="vm.isAuthenticated">
                    <a
                      class="nav-link"
                      [class.active]="!vm.selectedTag && vm.type == 'feed'"
                      (click)="getFeed()"
                      >Your Feed</a
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      (click)="getGlobal()"
                      [class.active]="!vm.selectedTag && vm.type == 'global'"
                      >Global Feed</a
                    >
                  </li>
                  <li class="nav-item" *ngIf="vm.selectedTag">
                    <a class="nav-link active"># {{ vm.selectedTag }}</a>
                  </li>
                </ul>
              </div>
              <ng-container *ngIf="!vm.articlesLoading; else articlesLoading">
                <app-article
                  [articles]="vm.articles"
                  (toggleFavorite)="toggleFavorite($event)"
                ></app-article>
              </ng-container>
              <ng-template #articlesLoading>
                <div class="article-preview">Loading...</div>
              </ng-template>
            </div>

            <div class="col-md-3">
              <div class="sidebar">
                <p>Popular Tags</p>

                <div *ngIf="!vm.tagsLoading; else tagsLoading" class="tag-list">
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
                </div>
                <ng-template #tagsLoading>
                  <p>Loading...</p>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
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

  constructor(
    private store: HomeStore,
    private authStore: AuthStore,
    private router: Router
  ) {}

  getArticleByTag(tag: string) {
    this.store.getArticleByTags(tag);
  }

  getFeed() {
    this.store.getFeed();
  }

  getGlobal() {
    this.store.getArticles();
  }

  toggleFavorite(article: Article) {
    if (!this.authStore.isAuthenticated) {
      void this.router.navigate(['/login']);
    } else {
      this.store.toggleFavorite(article);
    }
  }
}

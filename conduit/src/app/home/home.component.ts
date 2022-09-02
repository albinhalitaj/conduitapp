import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeStore, HomeVm } from './home.store';
import { provideComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { RouterLinkWithHref } from '@angular/router';
import Cookies from 'js-cookie';

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
                <ng-container *ngIf="vm.articles.length; else noArticles">
                  <div
                    *ngFor="let article of vm.articles"
                    class="article-preview"
                  >
                    <div class="article-meta">
                      <a [routerLink]="['/', '@' + article.author.username]"
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
                          [routerLink]="['/', '@' + article.author.username]"
                          class="author"
                          >{{ article.author.username }}</a
                        >
                        <span class="date">{{
                          article.createdAt | date: 'longDate'
                        }}</span>
                      </div>
                      <button
                        class="btn btn-outline-primary btn-sm pull-xs-right"
                      >
                        <i class="ion-heart"></i> {{ article.favoritesCount }}
                      </button>
                    </div>
                    <a
                      [routerLink]="['/article/', article.slug]"
                      class="preview-link"
                    >
                      <h1>{{ article.title }}</h1>
                      <p>{{ article.description }}</p>
                      <span>Read more...</span>
                      <ul *ngIf="article.tags.length > 0" class="tag-list">
                        <li
                          *ngFor="let tag of article.tags"
                          class="tag-default tag-pill tag-outline"
                        >
                          {{ tag }}
                        </li>
                      </ul>
                    </a>
                  </div>
                </ng-container>
              </ng-container>
              <ng-template #noArticles>
                <div class="article-preview">No articles are here... yet.</div>
              </ng-template>
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
  imports: [NgIf, AsyncPipe, NgForOf, RouterLinkWithHref, DatePipe],
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

  constructor(private store: HomeStore) {
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
}

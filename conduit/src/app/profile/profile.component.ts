import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLinkWithHref } from '@angular/router';
import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { Profile, ProfileStore, ProfileVm } from './profile.store';
import { provideComponentStore } from '@ngrx/component-store';
import Cookies from 'js-cookie';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: ` <div *ngIf="vm$ | async as vm" class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <ng-container *ngIf="vm.profile">
            <div class="col-xs-12 col-md-10 offset-md-1">
              <img
                [src]="
                  !vm.profile.image
                    ? 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                    : vm.profile.image
                "
                class="user-img"
                alt="Avatar"
              />
              <h4>{{ vm.profile.username }}</h4>
              <p>
                {{ vm.profile.bio }}
              </p>
              <button
                *ngIf="vm.user != vm.profile.username; else currentUser"
                (click)="followUser(vm.profile)"
                class="btn btn-sm btn-outline-secondary action-btn"
              >
                <i class="ion-plus-round"></i>
                &nbsp;
                {{ vm.profile.following ? 'Unfollow' : 'Follow' }}
                {{ vm.profile.username }}
              </button>
              <ng-template #currentUser>
                <a
                  [routerLink]="['/settings']"
                  class="btn btn-sm btn-outline-secondary action-btn"
                >
                  <i class="ion-gear-a"></i>
                  &nbsp; Edit Profile Settings
                </a>
              </ng-template>
            </div>
          </ng-container>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <a class="nav-link active" href="">My Articles</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="">Favorited Articles</a>
              </li>
            </ul>
          </div>

          <ng-container *ngIf="vm.articles.length > 0; else noArticles">
            <div *ngFor="let article of vm.articles" class="article-preview">
              <div class="article-meta">
                <a [routerLink]="['/', '@' + article.author.username]"
                  ><img [src]="article.author.image" alt="Avatar"
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
                <button class="btn btn-outline-primary btn-sm pull-xs-right">
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
        </div>
      </div>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponentStore(ProfileStore)],
  imports: [NgIf, AsyncPipe, NgForOf, DatePipe, RouterLinkWithHref],
})
export class ProfileComponent {
  vm$: Observable<ProfileVm> = this.store.vm$;

  constructor(private router: Router, private store: ProfileStore) {}

  followUser(profile: Profile) {
    const user = Cookies.get('user');
    if (!user) {
      void this.router.navigate(['/login']);
    } else {
      this.store.followUser(profile);
    }
  }
}

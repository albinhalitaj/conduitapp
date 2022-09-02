import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { Article } from '../home/home.store';
import { ActivatedRoute, Params } from '@angular/router';
import { defer, exhaustMap, map, Observable, pipe, switchMap } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { ApiService } from '../api.service';

interface ProfileState {
  profile: Profile | null;
  articles: Article[];
  favoritedArticles: Article[];
}

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

const initialState: ProfileState = {
  profile: null,
  articles: [],
  favoritedArticles: [],
};

export type ProfileVm = ProfileState & {
  user: string;
};

@Injectable()
export class ProfileStore
  extends ComponentStore<ProfileState>
  implements OnStateInit
{
  getProfile = this.effect<Params>(
    pipe(
      map((params: Params) => params['username']),
      switchMap((username: string) =>
        this.apiService.getProfile(username).pipe(
          tapResponse(
            (profile: Profile) => {
              this.patchState({ profile: profile });
            },
            (error) => console.log(error)
          )
        )
      )
    )
  );

  getProfileArticles = this.effect<Params>(
    pipe(
      map((params: Params) => params['username']),
      switchMap((username: string) => {
        return this.apiService.getArticlesByAuthor(username).pipe(
          tapResponse(
            (articles: Article[]) => {
              this.patchState({ articles: articles });
            },
            (error) => console.log(error)
          )
        );
      })
    )
  );

  followUser = this.effect<Profile>(
    exhaustMap((profile: Profile) =>
      defer(() => {
        if (profile.following) {
          return this.apiService.unFollowUser(profile.username);
        }
        return this.apiService.followUser(profile.username);
      }).pipe(
        tapResponse(
          (profile: Profile) => this.patchState({ profile }),
          (error) => console.log(error)
        )
      )
    )
  );

  readonly vm$: Observable<ProfileVm> = this.select(
    this.select((s) => s.profile),
    this.select((s) => s.articles),
    this.select((s) => s.favoritedArticles),
    this.authStore.user$.pipe(
      map((user) => {
        if (user) {
          return user.username;
        }
        return '';
      })
    ),
    (profile, articles, favoritedArticles, user) => ({
      profile,
      articles,
      favoritedArticles,
      user,
    })
  );

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private authStore: AuthStore
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getProfile(this.activatedRoute.params);
    this.getProfileArticles(this.activatedRoute.params);
  }
}

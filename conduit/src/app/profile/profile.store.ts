import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { Article } from '../home/home.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { defer, exhaustMap, map, Observable, pipe, switchMap } from 'rxjs';
import { AuthStore, User } from '../auth/auth.store';
import { ApiService } from '../api.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  readonly getProfile = this.effect<Params>(
    pipe(
      map((params: Params) => params['username']),
      switchMap((username: string) =>
        this.apiService.getProfile(username).pipe(
          tapResponse(
            (profile: Profile) => {
              this.patchState({ profile });
            },
            (errorResponse: HttpErrorResponse) => {
              if (errorResponse.status == 404) {
                void this.router.navigate(['/']);
              }
            }
          )
        )
      )
    )
  );

  readonly getProfileArticles = this.effect<Params>(
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

  readonly followUser = this.effect<Profile>(
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
    this.select((s: ProfileState) => s.profile),
    this.select((s: ProfileState) => s.articles),
    this.select((s: ProfileState) => s.favoritedArticles),
    this.authStore.user$.pipe(
      map((user: User | null) => {
        if (user) {
          return user.Username;
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
    private authStore: AuthStore,
    private router: Router
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getProfile(this.activatedRoute.params);
    this.getProfileArticles(this.activatedRoute.params);
  }
}

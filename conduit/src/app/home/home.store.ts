import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { exhaustMap, Observable, pipe, switchMap, tap } from 'rxjs';
import { HomeService } from './home.service';
import { AuthStore } from '../auth/auth.store';

export interface Author {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  favoritesCount: number;
  tags: string[];
  author: Author;
}

interface HomeState {
  articles: Article[];
  tags: string[];
  isLoading: boolean;
}

const initialState: HomeState = {
  articles: [],
  tags: [],
  isLoading: false,
};

export type HomeVm = HomeState & {
  isAuthenticated: boolean;
};

@Injectable()
export class HomeStore
  extends ComponentStore<HomeState>
  implements OnStateInit
{
  readonly articles$: Observable<Article[]> = this.select(
    (s: HomeState) => s.articles
  );
  readonly tags$: Observable<string[]> = this.select((s: HomeState) => s.tags);
  readonly isLoading$: Observable<boolean> = this.select(
    (s: HomeState) => s.isLoading
  );

  readonly vm$: Observable<HomeVm> = this.select(
    this.articles$,
    this.tags$,
    this.isLoading$,
    this.authStore.isAuthenticated$,
    (articles, tags, isLoading, isAuthenticated) => ({
      articles,
      tags,
      isLoading,
      isAuthenticated,
    }),
    { debounce: true }
  );

  readonly getArticles = this.effect<void>(
    pipe(
      tap(() => {
        this.patchState({ isLoading: true });
      }),
      switchMap(() =>
        this.homeService.getArticles().pipe(
          tapResponse(
            (articles: Article[]) => {
              this.patchState({ articles, isLoading: false });
            },
            (error) => console.log('Error while fetching articles', error)
          )
        )
      )
    )
  );

  readonly getTags = this.effect<void>(
    switchMap(() =>
      this.homeService.getTags().pipe(
        tapResponse(
          (tags: string[]) => {
            this.patchState({ tags });
          },
          (error) => console.log(error)
        )
      )
    )
  );
  readonly getArticleByTags = this.effect(
    exhaustMap((tag: string) =>
      this.homeService.getArticlesByTag(tag).pipe(
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles });
          },
          (error) => console.log(error)
        )
      )
    )
  );
  readonly getFeed = this.effect<void>(
    exhaustMap(() => {
      this.patchState({ isLoading: true });
      return this.homeService.getFeed().pipe(
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles, isLoading: false });
          },
          (error) => console.log(error)
        )
      );
    })
  );

  constructor(private homeService: HomeService, private authStore: AuthStore) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticles();
    this.getTags();
  }
}

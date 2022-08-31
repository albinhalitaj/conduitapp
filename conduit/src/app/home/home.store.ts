import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { delay, exhaustMap, Observable, switchMap } from 'rxjs';
import { HomeService } from './home.service';

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

export interface HomeState {
  articles: Article[];
  tags: string[];
  isLoading: boolean;
}

const initialState: HomeState = {
  articles: [],
  tags: [],
  isLoading: true,
};

@Injectable()
export class HomeStore
  extends ComponentStore<HomeState>
  implements OnStateInit
{
  readonly articles$: Observable<Article[]> = this.select((s) => s.articles);
  readonly tags$: Observable<string[]> = this.select((s) => s.tags);
  readonly isLoading$: Observable<boolean> = this.select((s) => s.isLoading);

  readonly vm$: Observable<HomeState> = this.select(
    this.articles$,
    this.tags$,
    this.select((s) => s.isLoading),
    (articles, tags, isLoading) => ({ articles, tags, isLoading }),
    { debounce: true }
  );

  readonly getArticles = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: true });
      return this.homeService.getArticles().pipe(
        delay(2000),
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles, isLoading: false });
          },
          (error) => console.log(error)
        )
      );
    })
  );
  readonly getTags = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: true });
      return this.homeService.getTags().pipe(
        tapResponse(
          (tags: string[]) => {
            this.patchState({ tags, isLoading: false });
          },
          (error) => console.log(error)
        )
      );
    })
  );
  readonly getArticleByTags = this.effect(
    exhaustMap((tag: string) => {
      this.patchState({ isLoading: true });
      return this.homeService.getArticlesByTag(tag).pipe(
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles, isLoading: false });
          },
          (error) => console.log(error)
        )
      );
    })
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

  constructor(private homeService: HomeService) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticles();
    this.getTags();
  }
}

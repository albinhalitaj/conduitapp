import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { exhaustMap, Observable, switchMap } from 'rxjs';
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

interface HomeState {
  articles: Article[];
  tags: string[];
}

const initialState: HomeState = {
  articles: [],
  tags: [],
};

@Injectable()
export class HomeStore
  extends ComponentStore<HomeState>
  implements OnStateInit
{
  constructor(private homeService: HomeService) {
    super(initialState);
  }

  readonly articles$: Observable<Article[]> = this.select((s) => s.articles);
  readonly tags$: Observable<string[]> = this.select((s) => s.tags);

  ngrxOnStateInit(): void {
    this.getArticles();
    this.getTags();
  }

  readonly getArticles = this.effect<void>(
    switchMap(() => {
      return this.homeService.getArticles().pipe(
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles });
          },
          (error) => console.log(error)
        )
      );
    })
  );

  readonly getTags = this.effect<void>(
    switchMap(() => {
      return this.homeService.getTags().pipe(
        tapResponse(
          (tags: string[]) => {
            this.patchState({ tags });
          },
          (error) => console.log(error)
        )
      );
    })
  );

  readonly getArticleByTags = this.effect(
    exhaustMap((tag: string) => {
      return this.homeService.getArticlesByTag(tag).pipe(
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles });
          },
          (error) => console.log(error)
        )
      );
    })
  );
}

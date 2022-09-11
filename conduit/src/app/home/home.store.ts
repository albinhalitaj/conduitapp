import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { defer, exhaustMap, Observable, pipe, switchMap, tap } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

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
  isFavorited: boolean;
  favoritesCount: number;
  tags: string[];
  author: Author;
}

interface HomeState {
  articles: Article[];
  tags: string[];
  selectedTag: string;
  type: 'global' | 'feed';
  articlesLoading: boolean;
  tagsLoading: boolean;
}

const initialState: HomeState = {
  articles: [],
  tags: [],
  selectedTag: '',
  type: 'global',
  articlesLoading: false,
  tagsLoading: false,
};

export type HomeVm = HomeState & {
  isAuthenticated: boolean;
};

@Injectable()
export class HomeStore
  extends ComponentStore<HomeState>
  implements OnStateInit
{
  private readonly articles$: Observable<Article[]> = this.select(
    (s: HomeState) => s.articles
  );
  private readonly tags$: Observable<string[]> = this.select(
    (s: HomeState) => s.tags
  );
  private readonly articlesLoading$: Observable<boolean> = this.select(
    (s: HomeState) => s.articlesLoading
  );
  private readonly tagsLoading$: Observable<boolean> = this.select(
    (s: HomeState) => s.tagsLoading
  );

  readonly vm$: Observable<HomeVm> = this.select(
    this.articles$,
    this.tags$,
    this.articlesLoading$,
    this.tagsLoading$,
    this.select((s: HomeState) => s.selectedTag),
    this.select((s: HomeState) => s.type),
    this.authStore.isAuthenticated$,
    (
      articles,
      tags,
      articlesLoading,
      tagsLoading,
      selectedTag,
      type,
      isAuthenticated
    ) => ({
      articles,
      tags,
      articlesLoading,
      tagsLoading,
      selectedTag,
      type,
      isAuthenticated,
    }),
    { debounce: true }
  );

  readonly getArticles = this.effect<void>(
    pipe(
      tap(() => {
        this.patchState({
          articlesLoading: true,
          selectedTag: '',
          type: 'global',
        });
      }),
      switchMap(() =>
        this.apiService.getArticles().pipe(
          tapResponse(
            (articles: Article[]) => {
              this.patchState({ articles, articlesLoading: false });
            },
            (error) => {
              this.patchState({ articlesLoading: false });
              console.log('error while fetching articles', error);
            }
          )
        )
      )
    )
  );

  readonly getTags = this.effect<void>(
    pipe(
      tap(() => this.patchState({ tagsLoading: true })),
      switchMap(() =>
        this.apiService.getTags().pipe(
          tapResponse(
            (tags: string[]) => {
              this.patchState({ tags, tagsLoading: false });
            },
            (error) => {
              console.log('error while fetching tags', error);
              this.patchState({ tagsLoading: false });
            }
          )
        )
      )
    )
  );

  readonly getArticleByTags = this.effect(
    switchMap((selectedTag: string) => {
      this.patchState({ articlesLoading: true, selectedTag });
      return this.apiService.getArticlesByTag(selectedTag).pipe(
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles, articlesLoading: false });
          },
          (error) => {
            console.log('Error while fetching article with tags', error);
            this.patchState({ articlesLoading: false });
          }
        )
      );
    })
  );
  readonly getFeed = this.effect<void>(
    switchMap(() => {
      this.patchState({ articlesLoading: true, selectedTag: '', type: 'feed' });
      return this.apiService.getFeed().pipe(
        tapResponse(
          (articles: Article[]) => {
            this.patchState({ articles, articlesLoading: false });
          },
          (error) => {
            console.log('Error while fetching feed', error);
            this.patchState({ articlesLoading: false });
          }
        )
      );
    })
  );

  toggleFavorite = this.effect<Article>(
    exhaustMap((article: Article) =>
      defer(() => {
        if (article.isFavorited) {
          return this.apiService.unFavoriteArticle(article.slug);
        }
        return this.apiService.favoriteArticle(article.slug);
      }).pipe(
        tapResponse(
          (updatedArticle: Article) => {
            this.setState((state: HomeState) => {
              return {
                ...state,
                articles: state.articles.map((article: Article) => {
                  if (article.slug == updatedArticle.slug) {
                    return updatedArticle;
                  }
                  return article;
                }),
              };
            });
          },
          (error) => console.log(error)
        )
      )
    )
  );

  constructor(private apiService: ApiService, private authStore: AuthStore) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.init();
  }

  init = this.effect<void>(
    switchMap(() => {
      return this.authStore.isAuthenticated$.pipe(
        tap((isAuthenticated: boolean) => {
          isAuthenticated ? this.getFeed() : this.getArticles();
          this.getTags();
        })
      );
    })
  );
}

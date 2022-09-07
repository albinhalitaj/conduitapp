import { Inject, Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { articleType } from '../../layouts/app-layout/app-layout.routes';
import { Article } from '../../home/home.store';
import { defer, exhaustMap, map, Observable, switchMap, tap } from 'rxjs';
import { ApiService } from '../../api.service';
import { ActivatedRoute, Params } from '@angular/router';

export interface ArticleListState {
  articles: Article[];
  loading: boolean;
}

const initialState: ArticleListState = {
  articles: [],
  loading: false,
};

@Injectable()
export class ArticleListStore
  extends ComponentStore<ArticleListState>
  implements OnStateInit
{
  articles$ = this.select((s) => s.articles);
  loading$ = this.select((s) => s.loading);

  vm$: Observable<ArticleListState> = this.select(
    this.articles$,
    this.loading$,
    (articles, loading) => ({ articles, loading }),
    { debounce: true }
  );

  getArticles = this.effect<string>(
    switchMap((type: string) =>
      this.activatedRoute.params.pipe(
        map((param: Params) => param['username']),
        tap(() => this.patchState({ loading: true })),
        switchMap((username: string) =>
          defer(() => {
            if (type === 'articles') {
              return this.apiService.getArticlesByAuthor(username);
            }
            return this.apiService.getFavorited(username);
          }).pipe(
            tapResponse(
              (articles: Article[]) => {
                this.setState({ articles, loading: false });
              },
              (error) => console.log(error)
            )
          )
        )
      )
    )
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
            this.setState((state: ArticleListState) => {
              const articles = state.articles.filter(
                (s: Article) => s.slug !== article.slug
              );
              return {
                ...state,
                loading: false,
                articles: updatedArticle.isFavorited
                  ? [...articles, updatedArticle]
                  : this.type == 'favorites'
                  ? articles.filter(
                      (s: Article) => s.slug !== updatedArticle.slug
                    )
                  : [...articles, updatedArticle],
              };
            });
          },
          (error) => console.log(error)
        )
      )
    )
  );

  constructor(
    @Inject(articleType) private type: string,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticles(this.type);
  }
}

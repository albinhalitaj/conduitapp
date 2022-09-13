import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { Article, Author } from '../home/home.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  defer,
  exhaustMap,
  forkJoin,
  map,
  Observable,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore, User } from '../auth/auth.store';
import { ApiService, Comment } from '../api.service';
import { Profile } from '../profile/profile.store';

export interface ArticleState {
  article: Article | null;
  comments: Comment[];
  error: '';
  loading: boolean;
}

const initialState: ArticleState = {
  article: null,
  error: '',
  comments: [],
  loading: false,
};

export type ArticleVm = ArticleState & {
  isOwner: boolean;
  user: User | null;
};

@Injectable()
export class ArticleStore
  extends ComponentStore<ArticleState>
  implements OnStateInit
{
  readonly vm$: Observable<ArticleVm> = this.select(
    this.select((s: ArticleState) => s.article),
    this.select((s: ArticleState) => s.comments),
    this.select((s: ArticleState) => s.loading),
    this.select((s: ArticleState) => s.error),
    this.authStore.user$,
    (article, comments, loading, error, user) => ({
      article,
      comments,
      loading,
      error,
      isOwner: article?.author.username == user?.username,
      user,
    })
  );

  readonly getArticle = this.effect<Params>(
    pipe(
      map((params: Params) => params['slug']),
      tap(() => this.patchState({ loading: true })),
      switchMap((slug: string) =>
        forkJoin([
          this.apiService.getArticle(slug),
          this.apiService.comments(slug),
        ]).pipe(
          tapResponse(
            ([article, comments]) => {
              this.patchState({
                article,
                comments,
                loading: false,
              });
            },
            ({ error }: HttpErrorResponse) =>
              this.patchState({ error: error.title, loading: false })
          )
        )
      )
    )
  );

  readonly toggleFavorite = this.effect<Article>(
    exhaustMap((article: Article) =>
      defer(() => {
        if (article.isFavorited) {
          return this.apiService.unFavoriteArticle(article.slug);
        }
        return this.apiService.favoriteArticle(article.slug);
      }).pipe(
        tapResponse(
          (updatedArticle: Article) => {
            this.patchState({ article: updatedArticle });
          },
          (error) => console.log(error)
        )
      )
    )
  );

  readonly postComment = this.effect(
    switchMap((body: string) =>
      this.route.params.pipe(
        map((params: Params) => params['slug']),
        switchMap((slug: string) =>
          this.apiService.addComment(slug, body).pipe(
            tapResponse(
              (comment: Comment) => {
                this.patchState((state: ArticleState) => {
                  return {
                    ...state,
                    comments: [...state.comments, comment],
                  };
                });
              },
              (error) => console.log(error)
            )
          )
        )
      )
    )
  );

  readonly deleteArticle = this.effect<string>(
    exhaustMap((slug: string) => {
      return this.apiService.deleteArticle(slug).pipe(
        tapResponse(
          () => {
            void this.router.navigate(['/']);
          },
          (error) => console.log(error)
        )
      );
    })
  );

  readonly favoriteArticle = this.effect<string>(
    exhaustMap((slug: string) => {
      return this.apiService.favoriteArticle(slug).pipe(
        tapResponse(
          (response: any) => {
            this.patchState({ article: response.article });
          },
          ({ error }: HttpErrorResponse) =>
            this.patchState({ error: error.title })
        )
      );
    })
  );

  readonly followUser = this.effect<Author>(
    exhaustMap((author: Author) =>
      defer(() => {
        if (author.following) {
          return this.apiService.unFollowUser(author.username);
        }
        return this.apiService.followUser(author.username);
      }).pipe(
        tapResponse(
          (profile: Profile) => {
            this.patchState((state: ArticleState) => {
              return {
                ...state,
                article: {
                  ...state.article!,
                  author: profile,
                },
              };
            });
          },
          (error) => console.log(error)
        )
      )
    )
  );

  readonly deleteComment = this.effect<{ commentId: string; slug: string }>(
    exhaustMap(({ commentId, slug }) => {
      return this.apiService.deleteComment(commentId, slug).pipe(
        tapResponse(
          () => {
            this.patchState((state: ArticleState) => {
              return {
                ...state,
                comments: state.comments.filter(
                  (c: Comment) => c.id !== commentId
                ),
              };
            });
          },
          (error) => console.log(error)
        )
      );
    })
  );

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    private router: Router
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticle(this.route.params);
  }
}

import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { Article } from '../home/home.store';
import { ActivatedRoute, Params } from '@angular/router';
import { forkJoin, map, Observable, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore, User } from '../auth/auth.store';
import { ApiService, Comment } from '../api.service';

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
    this.select((s) => s.article),
    this.select((s) => s.comments),
    this.select((s) => s.loading),
    this.select((s) => s.error),
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

  postComment = this.effect(
    switchMap((body: string) =>
      this.route.params.pipe(
        map((params: Params) => params['slug']),
        switchMap((slug: string) =>
          this.apiService.addComment(slug, body).pipe(
            tapResponse(
              (comment) => {
                this.patchState({ comments: Array.from(comment) });
              },
              (error) => console.log(error)
            )
          )
        )
      )
    )
  );

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private authStore: AuthStore
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticle(this.route.params);
  }
}

import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { Article } from '../home/home.store';
import { ActivatedRoute, Params } from '@angular/router';
import { forkJoin, map, Observable, pipe, switchMap, tap } from 'rxjs';
import { ArticleService, Comment } from './article.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore } from '../auth/auth.store';

export interface ArticleState {
  article: Article | null;
  comments: Comment[] | [];
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
    this.authStore.user$.pipe(
      map((user) => {
        return user?.username;
      })
    ),
    (article, comments, loading, error, username) => ({
      article,
      comments,
      loading,
      error,
      isOwner: article?.author.username == username,
    })
  );

  readonly getArticle = this.effect<Params>(
    pipe(
      map((params: Params) => params['slug']),
      tap(() => this.patchState({ loading: true })),
      switchMap((slug: string) =>
        forkJoin([
          this.articleService.getArticle(slug),
          this.articleService.comments(slug),
        ]).pipe(
          tapResponse(
            ([article, comments]) =>
              this.patchState({ article, comments, loading: false }),
            ({ error }: HttpErrorResponse) =>
              this.patchState({ error: error.title, loading: false })
          )
        )
      )
    )
  );

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private authStore: AuthStore
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticle(this.route.params);
  }
}

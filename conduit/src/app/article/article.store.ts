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

@Injectable()
export class ArticleStore
  extends ComponentStore<ArticleState>
  implements OnStateInit
{
  readonly article$: Observable<Article | null> = this.select(
    (s: ArticleState) => s.article
  );

  readonly comments$: Observable<Comment[]> = this.select((s) => s.comments);

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

  /*readonly comments = this.effect(
    switchMap((articleId: string) => {
      return this.articleService.comments(articleId).pipe(
        tapResponse(
          (comments: Comment[]) => {
            this.patchState({ comments });
          },
          ({ error }: HttpErrorResponse) =>
            this.patchState({ error: error.title })
        )
      );
    })
  );*/

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticle(this.route.params);
  }
}

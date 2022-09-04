import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { exhaustMap, map, pipe, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService, ArticleData } from '../api.service';
import { Article } from '../home/home.store';

export interface EditorState {
  success: boolean;
  error: '';
  loading: boolean;
  article: Article | null;
}

const initialState: EditorState = {
  success: false,
  error: '',
  loading: false,
  article: null,
};

@Injectable()
export class EditorStore
  extends ComponentStore<EditorState>
  implements OnStateInit
{
  addArticle = this.effect(
    exhaustMap((article: ArticleData) => {
      this.patchState({ loading: true });
      return this.apiService.addArticle(article).pipe(
        tapResponse(
          () => {
            this.patchState({ success: true, loading: false });
            void this.router.navigate(['/']);
          },
          ({ error }: HttpErrorResponse) => {
            this.patchState({
              success: false,
              loading: false,
              error: error.title,
            });
          }
        )
      );
    })
  );

  /*
    editArticle = this.effect(
      exhaustMap((article: ArticleData) => {
        return this.apiService.updateArticle(,article).pipe(
          tapResponse(() => {

          },error => console.log(error))
        );
      })
    );
  */

  getArticle = this.effect<Params>(
    pipe(
      map((params: Params) => params['slug']),
      switchMap((slug: string) => {
        return this.apiService.getArticle(slug).pipe(
          tapResponse(
            (article: Article) => {
              this.patchState({ article });
            },
            (error) => console.log(error)
          )
        );
      })
    )
  );

  constructor(
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(initialState);
  }

  ngrxOnStateInit(): void {
    this.getArticle(this.activatedRoute.params);
  }
}

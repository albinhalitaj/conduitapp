import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { exhaustMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService, ArticleData } from '../api.service';

export interface EditorState {
  success: boolean;
  error: '';
  loading: boolean;
}

const initialState: EditorState = {
  success: false,
  error: '',
  loading: false,
};

@Injectable()
export class EditorStore extends ComponentStore<EditorState> {
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

  constructor(private apiService: ApiService, private router: Router) {
    super(initialState);
  }
}

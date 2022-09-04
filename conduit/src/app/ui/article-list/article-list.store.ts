import { Inject, Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { articleType } from '../../layouts/app-layout/app-layout.routes';
import { Article } from '../../home/home.store';
import { defer, map, switchMap } from 'rxjs';
import { ApiService } from '../../api.service';
import { ActivatedRoute, Params } from '@angular/router';

interface ArticleListState {
  articles: Article[];
}

const initialState: ArticleListState = {
  articles: [],
};

@Injectable()
export class ArticleListStore
  extends ComponentStore<ArticleListState>
  implements OnStateInit
{
  articles$ = this.select((s) => s.articles);

  getArticles = this.effect<string>(
    switchMap((type: string) =>
      this.activatedRoute.params.pipe(
        map((param: Params) => param['username']),
        switchMap((username: string) =>
          defer(() => {
            if (type == 'articles') {
              return this.apiService.getArticlesByAuthor(username);
            }
            return this.apiService.getFavorited(username);
          }).pipe(
            tapResponse(
              (articles: Article[]) => {
                this.setState({ articles });
              },
              (error) => console.log(error)
            )
          )
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

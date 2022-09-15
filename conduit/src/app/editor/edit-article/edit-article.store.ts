import { Injectable } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  tapResponse,
} from '@ngrx/component-store';
import { Article } from '../../home/home.store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService, ArticleData } from '../../api.service';
import { exhaustMap, map, Observable, pipe, switchMap, tap } from 'rxjs';
import { AuthStore, User } from '../../auth/auth.store';

interface EditArticleState {
  article: Article | null;
}

@Injectable()
export class EditArticleStore
  extends ComponentStore<EditArticleState>
  implements OnStateInit
{
  readonly article$: Observable<Article | null> = this.select((s) => s.article);
  readonly getArticle = this.effect<Params>(
    pipe(
      map((params: Params) => params['slug']),
      switchMap((slug) => {
        return this.apiService.getArticle(slug).pipe(
          switchMap((article: Article) => {
            return this.authStore.user$.pipe(
              map((user: User | null) => {
                if (user && user.username == article.author.username) {
                  return article;
                }
                return null;
              })
            );
          }),
          tap((article: Article | null) => {
            if (article) {
              this.setState({ article });
            } else {
              void this.router.navigate(['/']);
            }
          })
        );
      })
    )
  );
  readonly updateArticle = this.effect<ArticleData>(
    exhaustMap((article: ArticleData) => {
      return this.activatedRoute.params.pipe(
        map((params: Params) => params['slug']),
        switchMap((slug: string) => {
          return this.apiService.updateArticle(slug, article).pipe(
            tapResponse(
              () => {
                void this.router.navigate(['/article', slug]);
              },
              (error) => console.log('error while updating article', error)
            )
          );
        })
      );
    })
  );

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private authStore: AuthStore,
    private router: Router
  ) {
    super({ article: null });
  }

  ngrxOnStateInit(): void {
    this.getArticle(this.activatedRoute.params);
  }
}

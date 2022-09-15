import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { provideComponentStore } from '@ngrx/component-store';
import { EditArticleStore } from './edit-article.store';
import { Observable } from 'rxjs';
import { Article } from '../../home/home.store';
import { ArticleFormComponent } from '../../ui/article-form/article-form.component';
import { ArticleData } from '../../api.service';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  template: `
    <div class="editor-page" *ngIf="article | async as article">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <app-article-form
              [article]="article"
              (onSubmit)="update($event)"
            ></app-article-form>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    ArticleFormComponent,
  ],
  providers: [provideComponentStore(EditArticleStore)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditArticleComponent {
  readonly article: Observable<Article | null> = this.store.article$;

  constructor(private store: EditArticleStore) {}

  update(article: ArticleData) {
    this.store.updateArticle(article);
  }
}

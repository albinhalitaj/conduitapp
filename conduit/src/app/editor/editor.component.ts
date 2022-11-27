import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { EditorStore } from './editor.store';
import { ArticleFormComponent } from '../ui/article-form/article-form.component';
import { ArticleData } from '../api.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  template: ` 
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <app-article-form (onSubmit)="publish($event)"> </app-article-form>
        </div>
      </div>
    </div>
  </div>`,
  imports: [ReactiveFormsModule, NgForOf, ArticleFormComponent],
  providers: [EditorStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent {
  constructor(private store: EditorStore) {}

  publish(article: ArticleData) {
    this.store.addArticle(article);
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgForOf } from '@angular/common';
import { EditorStore } from './editor.store';

@Component({
  selector: 'app-editor',
  standalone: true,
  template: ` <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <form [formGroup]="articleForm" (ngSubmit)="publish()">
            <fieldset>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="Article Title"
                  formControlName="title"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="What's this article about?"
                  formControlName="description"
                />
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  class="form-control"
                  rows="8"
                  placeholder="Write your article (in markdown)"
                  formControlName="body"
                ></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input
                  #tag
                  type="text"
                  class="form-control"
                  placeholder="Enter tags"
                  (keydown.enter)="addTag(tag)"
                />
                <div class="tag-list">
                  <span
                    *ngFor="let tag of articleForm.controls['tags'].value"
                    (click)="removeTag(tag)"
                    class="tag-default tag-pill ng-binding ng-scope"
                  >
                    <i class="ion-close-round" (click)="removeTag(tag)"></i>
                    {{ tag }}
                  </span>
                </div>
              </fieldset>
              <button
                class="btn btn-lg pull-xs-right btn-primary"
                (click)="publish()"
                type="button"
              >
                Publish Article
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>`,
  imports: [ReactiveFormsModule, NgForOf],
  providers: [EditorStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  articleForm: FormGroup = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    body: ['', Validators.required],
    tags: [<string[]>[]],
  });

  constructor(private fb: FormBuilder, private store: EditorStore) {}

  publish() {
    this.store.addArticle(this.articleForm.getRawValue());
  }

  addTag(tag: HTMLInputElement) {
    if (!tag.value.trim()) return;
    this.articleForm.controls['tags'].patchValue([
      ...this.articleForm.controls['tags'].value,
      tag.value.trim(),
    ]);
    tag.value = '';
  }

  removeTag(tag: string) {
    this.articleForm.controls['tags'].patchValue(
      this.articleForm.controls['tags'].value.filter((x: string) => x != tag)
    );
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NgForOf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Article } from '../../home/home.store';
import { ArticleData } from '../../api.service';

@Component({
  selector: 'app-article-form',
  standalone: true,
  template: `
    <form [formGroup]="articleForm" (ngSubmit)="submit()">
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
          (click)="submit()"
          type="button"
        >
          Publish Article
        </button>
      </fieldset>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgForOf, ReactiveFormsModule],
})
export class ArticleFormComponent {
  @Input() set article(article: Article) {
    this.articleForm.setValue({
      title: article.title,
      description: article.description,
      body: article.body,
      tags: article.tags,
    });
  }

  articleForm: FormGroup = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    body: ['', Validators.required],
    tags: [<string[]>[]],
  });

  @Output() onSubmit = new EventEmitter<ArticleData>();

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

  submit() {
    if (this.articleForm.valid) {
      this.onSubmit.emit(this.articleForm.getRawValue());
    } else {
      this.articleForm.markAllAsTouched();
    }
  }

  constructor(private fb: FormBuilder) {}
}

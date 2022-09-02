import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  template: `
    <form [formGroup]="comment" (ngSubmit)="add()" class="card comment-form">
      <div class="card-block">
        <textarea
          formControlName="body"
          class="form-control"
          placeholder="Write a comment..."
          rows="3"
        ></textarea>
      </div>
      <div class="card-footer">
        <img
          [src]="
            !image ? 'https://api.realworld.io/images/smiley-cyrus.jpeg' : image
          "
          alt="Avatar"
          class="comment-author-img"
        />
        <button class="btn btn-sm btn-primary">Post Comment</button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class CommentFormComponent {
  @Input() image!: string | undefined;

  @Output() postComment = new EventEmitter<string>();
  comment: FormGroup = this.fb.nonNullable.group({
    body: ['', Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  add() {
    this.postComment.emit(this.comment.getRawValue());
  }
}

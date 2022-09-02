import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Comment } from '../../api.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-comment',
  standalone: true,
  template: `
    <div *ngFor="let comment of comments" class="card">
      <div class="card-block">
        <p class="card-text">
          {{ comment.body }}
        </p>
      </div>
      <div class="card-footer">
        <a class="comment-author">
          <img
            [src]="
              !comment.author.image
                ? 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                : comment.author.image
            "
            alt="Avatar"
            class="comment-author-img"
          />
        </a>
        &nbsp;
        <a href="" class="comment-author">{{ comment.author.username }}</a>
        <span class="date-posted">{{
          comment.createdAt | date: 'longDate'
        }}</span>
        <span *ngIf="username == comment.author.username" class="mod-options">
          <i class="ion-edit"></i>
          <i class="ion-trash-a"></i>
        </span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgForOf, NgIf, DatePipe],
})
export class CommentComponent {
  @Input() comments!: Comment[];
  @Input() username!: string | undefined;
}

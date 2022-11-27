import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Comment } from '../../api.service';
import { DatePipe, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

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
        <a
          class="comment-author"
          [routerLink]="['/profile', comment.author.username]"
        >
          <img
            [ngSrc]="
              !comment.author.image
                ? 'https://api.realworld.io/images/smiley-cyrus.jpeg'
                : comment.author.image
            "
            alt="Avatar"
            class="comment-author-img"
          />
        </a>
        &nbsp;
        <a
          [routerLink]="['/profile', comment.author.username]"
          class="comment-author"
          >{{ comment.author.username }}</a
        >
        <span class="date-posted">{{
          comment.createdAt | date: 'longDate'
        }}</span>
        <span *ngIf="username == comment.author.username" class="mod-options">
          <i (click)="editComment.emit(comment.body)" class="ion-edit"></i>
          <i (click)="deleteComment.emit(comment.id)" class="ion-trash-a"></i>
        </span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgForOf, NgIf, DatePipe, RouterLink, NgOptimizedImage],
})
export class CommentComponent {
  @Input() comments!: Comment[];
  @Input() username!: string | undefined;

  @Output() deleteComment = new EventEmitter<string>();
  @Output() editComment = new EventEmitter<string>();
}

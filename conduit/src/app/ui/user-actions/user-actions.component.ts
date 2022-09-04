import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Author } from '../../home/home.store';

@Component({
  selector: 'app-user-actions',
  standalone: true,
  template: `
    <button
      (click)="followUser.emit(author.username)"
      class="btn btn-sm btn-outline-secondary"
    >
      <i class="ion-plus-round"></i>
      &nbsp;
      {{ author.following ? 'Unfollow' : 'Follow' }}
      {{ author.username }}
    </button>
    &nbsp;
    <button
      (click)="favoriteArticle.emit()"
      class="btn btn-sm btn-outline-primary"
    >
      <i class="ion-heart"></i>
      &nbsp; Favorite Post
      <span class="counter">({{ favoritesCount }})</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserActionsComponent {
  @Input() favoritesCount!: number;
  @Input() author!: Author;

  @Output() favoriteArticle = new EventEmitter();
  @Output() followUser = new EventEmitter<string>();
}

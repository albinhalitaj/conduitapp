import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Author } from '../../home/home.store';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-actions',
  standalone: true,
  template: `
    <button
      (click)="followUser.emit(author.username)"
      [ngClass]="{
        'btn-outline-secondary': !author.following,
        'btn-secondary': author.following
      }"
      class="btn btn-sm"
    >
      <i class="ion-plus-round"></i>
      &nbsp;
      {{ author.following ? 'Unfollow' : 'Follow' }}
      {{ author.username }}
    </button>
    &nbsp;
    <button
      (click)="favoriteArticle.emit()"
      [ngClass]="{
        'btn-outline-primary': !isFavorited,
        'btn-primary': isFavorited
      }"
      class="btn btn-sm"
    >
      <i class="ion-heart"></i>
      &nbsp; {{ isFavorited ? 'Unfavorite article' : 'Favorite article' }}
      <span class="counter">({{ favoritesCount }})</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class UserActionsComponent {
  @Input() favoritesCount!: number;
  @Input() isFavorited!: boolean;
  @Input() author!: Author;

  @Output() favoriteArticle = new EventEmitter();
  @Output() followUser = new EventEmitter<string>();
}

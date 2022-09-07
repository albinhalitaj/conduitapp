import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-owner-actions',
  standalone: true,
  template: `
    <button
      (click)="editArticle.emit()"
      class="btn btn-outline-secondary btn-sm"
    >
      <i class="ion-edit"></i>
      &nbsp; Edit Article
    </button>
    &nbsp;
    <button
      (click)="deleteArticle.emit()"
      class="btn btn-outline-danger btn-sm"
    >
      <i class="ion-trash-a"></i>
      &nbsp; Delete Article
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnerActionsComponent {
  @Output() editArticle = new EventEmitter();
  @Output() deleteArticle = new EventEmitter();
}

import { Component } from '@angular/core';

import { Post } from './post';

@Component({
  selector: 'post-item',
  inputs: ['post'],
  templateUrl: 'app/post-item.component.html'
})
export class PostItemComponent {
  post: Post;

  getFormattedDate(): string {
    return this.post.created_at;
  }
}

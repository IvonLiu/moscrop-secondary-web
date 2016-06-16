import { Component } from '@angular/core';
import { Router } from '@angular/router-deprecated';

import { Post } from './post';

@Component({
  selector: 'post-item',
  inputs: ['post'],
  templateUrl: 'app/post-item.component.html'
})
export class PostItemComponent {
  post: Post;

  constructor(private router: Router) {}

  getFormattedDate(): string {
    return this.post.created_at;
  }

  showDetails(): void {
    let link = ['PostDetail', { id: this.post.id }];
    this.router.navigate(link);
  }
}

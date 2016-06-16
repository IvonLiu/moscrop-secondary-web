import { Component, OnInit } from '@angular/core';
import { RouteParams } from '@angular/router-deprecated';

import { Post } from './post';
import { PostService } from './post.service';
import { User } from './user';
import { UserService } from './user.service';
import { Category } from './category';
import { CategoryService } from './category.service';

@Component({
  selector: 'post-list',
  templateUrl: 'app/post-detail.component.html'
})
export class PostDetailComponent implements OnInit {

  post: Post;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private categoryService: CategoryService,
    private routeParams: RouteParams) {
  }

  ngOnInit() {
    this.getPost();
  }

  private getPost() {
    let id = +this.routeParams.get('id');
    var temp: Post;
    this.postService
      .getPost(id)
      .then((post) => temp = post)
      .then(() => {
        return this.categoryService.getCategory(temp.category);
      })
      .then((category) => temp.categoryName = category.name)
      .then(() => {
        return this.userService.getUser(temp.author);
      })
      .then((user) => temp.authorInfo = user)
      .then(() => this.post = temp)
      .then(() => console.log(this.post))
      .catch(error => console.error(error));
  }

  getFormattedDate(): string {
    return this.post.created_at;
  }

}

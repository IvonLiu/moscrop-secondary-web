import { Component, OnInit } from '@angular/core';

import { Post } from './post';
import { PostService } from './post.service';
import { PostItemComponent } from './post-item.component';
import { User } from './user';
import { UserService } from './user.service';
import { Category } from './category';
import { CategoryService } from './category.service';

@Component({
  selector: 'post-list',
  directives: [PostItemComponent],
  templateUrl: 'app/post-list.component.html'
})
export class PostListComponent implements OnInit {

  posts: Post[];

  constructor(
    private postService: PostService,
    private userService: UserService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.getPostList();
  }

  private getPostList() {
    var temp: Post[] = [];
    this.postService
      .getPosts()
      .then((posts) => temp = posts)
      .then(() => {
        var fetchCategories = temp.map((post) => this.categoryService.getCategory(post.category));
        return Promise.all(fetchCategories);
      })
      .then((categories) => {
        for (var i=0; i<temp.length; i++) {
          temp[i].categoryName = categories[i].name;
        }
      })
      .then(() => {
        var fetchUsers = temp.map((post) => this.userService.getUser(post.author));
        return Promise.all(fetchUsers);
      })
      .then((users) => {
        for (var i=0; i<temp.length; i++) {
          temp[i].authorInfo = users[i];
        }
      })
      .then(() => this.posts = temp)
      .then(() => console.log(this.posts))
      .catch(error => console.error(error));
  }

}

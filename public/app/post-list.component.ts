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

  categories: Category[];
  currentCategory: Category;

  posts: Post[];

  constructor(
    private postService: PostService,
    private userService: UserService,
    private categoryService: CategoryService
  ) {
    this.currentCategory = null;
  }

  ngOnInit() {
    this.getCategoryList();
    this.getPostList();
  }

  changeCategory(category: Category) {
    this.currentCategory = category;
    this.getPostList();
  }

  private getCategoryList() {
    this.categoryService
      .getCategories()
      .then((categories) => this.categories = categories)
      .catch(error => console.error(error));
  }

  private getPostList() {
    var temp: Post[] = [];
    (this.currentCategory ? this.categoryService.getPosts(this.currentCategory.id) : this.postService.getPosts())
      .then((posts) => temp = posts)
      .then(() => {
        var fetchCategories = temp.map((post) => this.categoryService.getCategory(post.category));
        return Promise.all(fetchCategories);
      })
      .then((categories: Category[]) => {
        for (var i=0; i<temp.length; i++) {
          temp[i].categoryName = categories[i].name;
        }
      })
      .then(() => {
        var fetchUsers = temp.map((post) => this.userService.getUser(post.author));
        return Promise.all(fetchUsers);
      })
      .then((users: User[]) => {
        for (var i=0; i<temp.length; i++) {
          temp[i].authorInfo = users[i];
        }
      })
      .then(() => this.posts = temp)
      .catch(error => console.error(error));
  }

}

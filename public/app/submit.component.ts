import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router-deprecated';

import { Post } from './post';
import { Category } from './category';
import { UserService } from './user.service';
import { PostService } from './post.service';

declare var $: any;

@Component({
  selector: 'submit',
  templateUrl: 'app/submit.component.html'
})
export class SubmitComponent implements OnInit, AfterViewInit {

  currentUserId: number;
  categories: Category[];
  currentCategory: Category;

  @ViewChild('content') content: ElementRef;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private router: Router) {
    this.currentUserId = this.userService.currentUserId();
  }

  ngOnInit() {
    this.getUserCategories();
  }

  ngAfterViewInit() {
    $(this.content.nativeElement).froalaEditor({
      imageUploadParam: 'foo_bar_test_upload',
      imageUploadURL: 'http://localhost:3000/api/uploads/images',
      imageUploadParams: {test_param: 'this is a test'},
      imageMaxSize: 5 * 1024 * 1024,
      imageAllowedTypes: ['jpeg', 'jpg', 'png'],
      requestWithCORS: false
    })
    .on('froalaEditor.image.error', function(e, editor, error, response) {
      console.log(error);
    });
  }

  private getUserCategories() {
    this.userService
      .getCategories(this.currentUserId)
      .then((categories) => this.categories = categories)
      .catch(error => console.error(error));
  }

  changeCategory(category: Category) {
    this.currentCategory = category;
  }

  submit(title: HTMLInputElement, content: HTMLInputElement): void {
    console.log('Attempting to submit stuff');
    if (title.value && this.currentCategory && content.value) {
      let post = new Post();
      post.title = title.value;
      post.category = this.currentCategory.id;
      post.content = content.value;
      this.postService.addPost(post)
        .then((response) => console.log(response))
        .then(() => this.router.navigate(['Posts']))
        .catch(error => console.error(error));
    } else {
      console.log('Some field is empty');
    }
  }

}

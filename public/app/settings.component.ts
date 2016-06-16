import { Component, OnInit } from '@angular/core';

import { Category } from './category';
import { CategoryComponent } from './category.component';
import { UserService } from './user.service';

@Component({
  selector: 'settings',
  directives: [CategoryComponent],
  templateUrl: 'app/settings.component.html'
})
export class SettingsComponent implements OnInit {

  currentUserId: number;
  categories: Category[];

  constructor(private userService: UserService) {
    this.currentUserId = this.userService.currentUserId();
  }

  ngOnInit() {
    this.getUserCategories();
  }

  private getUserCategories() {
    this.userService
      .getCategories(this.currentUserId)
      .then((categories) => this.categories = categories)
      .catch(error => console.error(error));
  }

  private categoryClicked(category: Category) {
    console.log('clicked: ' + category.name);
  }

}

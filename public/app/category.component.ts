import { Component, EventEmitter } from '@angular/core';

import { Category } from './category';

@Component({
  selector: 'category',
  inputs: ['category'],
  outputs: ['onCategoryAction'],
  templateUrl: 'app/category.component.html'
})
export class CategoryComponent {

  onCategoryAction: EventEmitter<Category>;
  category: Category;

  constructor() {
    this.onCategoryAction = new EventEmitter();
  }

  action() {
    this.onCategoryAction.emit(this.category);
  }
}

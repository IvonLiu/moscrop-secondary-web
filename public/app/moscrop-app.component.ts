import { Component } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { CategoryService } from './category.service';

@Component({
  selector: 'moscrop-app',
  templateUrl: 'app/moscrop-app.component.html',
  providers: [CategoryService]
})
export class MoscropApp {

  constructor(private categoryService: CategoryService) {}

  test(): void {
    this.categoryService.getCategories().then(data => console.log('All:', JSON.stringify(data)));
    this.categoryService.getCategory(2).then(data => console.log('Single:', JSON.stringify(data)));
  }

/*  messages: Message[];

  constructor() {
    this.messages = [];
  }

  addMessage(message: HTMLInputElement): void {
    if (message.value) {
      this.messages.push(new Message('User', message.value, new Date().getTime()));
      message.value = '';
    }
  }
*/
}

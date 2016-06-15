import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';

import { PostListComponent } from './post-list.component';
import { PostService } from './post.service';
import { CategoryService } from './category.service';
import { UserService } from './user.service';
import { SettingsComponent } from './settings.component';

@Component({
  selector: 'moscrop-app',
  templateUrl: 'app/moscrop-app.component.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [
    ROUTER_PROVIDERS,
    PostService,
    CategoryService,
    UserService
  ]
})
@RouteConfig([
  {
    path: '/posts',
    name: 'Posts',
    component: PostListComponent,
    useAsDefault: true
  }, {
    path: '/settings',
    name: 'Settings',
    component: SettingsComponent
  }
])
export class MoscropApp {

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

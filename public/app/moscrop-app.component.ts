import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';

import { PostListComponent } from './post-list.component';
import { PostDetailComponent } from './post-detail.component';
import { PostService } from './post.service';
import { CategoryService } from './category.service';
import { UserService } from './user.service';
import { SubmitComponent } from './submit.component';
import { SettingsComponent } from './settings.component';
import { TestPanelComponent } from './test-panel.component';

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
    path: '/posts/:id',
    name: 'PostDetail',
    component: PostDetailComponent,
  }, {
    path: '/submit',
    name: 'Submit',
    component: SubmitComponent
  }, {
    path: '/settings',
    name: 'Settings',
    component: SettingsComponent
  }, {
    path: '/test',
    name: 'Test',
    component: TestPanelComponent
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

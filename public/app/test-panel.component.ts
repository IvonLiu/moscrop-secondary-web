import { Component } from '@angular/core';

import { UserService } from './user.service';

@Component({
  selector: 'test-panel',
  templateUrl: 'app/test-panel.component.html'
})
export class TestPanelComponent {

  constructor(private userService: UserService) {}

  saveToken() {
    this.userService.saveToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNDY1NjA5MzMwfQ.ibT_XKrAhXkAV561_QYZgpAbU5YEbp42r2Cul-6lPaM');
  }

  getToken() {
    console.log('Token:', this.userService.getToken());
  }

  currentUserId() {
    console.log('User ID:', this.userService.currentUserId());
  }

  logOut() {
    this.userService.logOut();
  }

}

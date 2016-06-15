import { Component } from '@angular/core';
import {
  FORM_DIRECTIVES,
  FormBuilder,
  ControlGroup,
  Validators,
  AbstractControl
} from '@angular/common';

@Component({
  selector: 'login',
  templateUrl: 'app/login.component.html'
})
export class LoginComponent {

  loginForm: ControlGroup;
  username: AbstractControl;
  password: AbstractControl;

  constructor(fb: FormBuilder) {
    this.loginForm = fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required]
    });
    this.username = this.loginForm.controls['username'];
    this.password = this.loginForm.controls['password'];
  }

}

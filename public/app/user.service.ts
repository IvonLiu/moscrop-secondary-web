import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'atob/browser-atob';
import 'rxjs/add/operator/toPromise';

import { User } from './user';

@Injectable()
export class UserService {

  private urlBase = 'http://localhost:3000/api/users'

  constructor(private http: Http) { }

  saveToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  getToken(): string {
    return localStorage.getItem('jwt');
  }

  currentUserId(): number {
    var token = this.getToken();
    if (token) {
      var payload = JSON.parse(atob(token.split('.')[1]));
      return +payload.id;
    } else {
      return null;
    }
  }

  logOut(): void {
    localStorage.removeItem('jwt');
    // TODO return user to main page
  }

  getUsers(): Promise<User[]> {
    return this.http.get(this.urlBase)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getUser(id: number): Promise<User> {
    let url = `${this.urlBase}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}

import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Post } from './post';
import { UserService } from './user.service';

@Injectable()
export class PostService {

  private urlBase = 'http://localhost:3000/api/posts'

  constructor(
    private http: Http,
    private userService: UserService) { }

  getPosts(): Promise<Post[]> {
    return this.http.get(this.urlBase)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getPost(id: number): Promise<Post> {
    let url = `${this.urlBase}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  addPost(post: Post): Promise<string> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let token = this.userService.getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    console.log(JSON.stringify([post]));
    console.log(headers);
    return this.http.post(this.urlBase, JSON.stringify([post]), { headers: headers })
      .toPromise()
      .then(response => response.text())
      .catch(this.handleError);
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}

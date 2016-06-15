import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Post } from './post';

@Injectable()
export class PostService {

  private urlBase = 'http://localhost:3000/api/posts'

  constructor(private http: Http) { }

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

  private handleError(error: any) {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}

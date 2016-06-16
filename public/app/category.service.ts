import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Category } from './category';
import { Post } from './post';

@Injectable()
export class CategoryService {

  private urlBase = 'http://localhost:3000/api/categories'

  constructor(private http: Http) { }

  getCategories(): Promise<Category[]> {
    return this.http.get(this.urlBase)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getCategory(id: number): Promise<Category> {
    let url = `${this.urlBase}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getPosts(id: number): Promise<Post[]> {
    let url = `${this.urlBase}/${id}/posts`;
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

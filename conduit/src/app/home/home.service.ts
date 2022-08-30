import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Article } from './home.store';
import { API_URL } from '../app.component';

@Injectable({ providedIn: 'root' })
export class HomeService {
  constructor(
    @Inject(API_URL) private apiBase: string,
    private http: HttpClient
  ) {}

  getArticles(): Observable<Article[]> {
    return this.http
      .get(`${this.apiBase}/articles`, {
        withCredentials: true,
      })
      .pipe(
        map((response: any) => {
          return response.articles;
        })
      );
  }

  getTags(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.apiBase}/tags`, {
        withCredentials: true,
      })
      .pipe(
        map((response: any) => {
          return response.tags;
        })
      );
  }

  getArticlesByTag(tag: string): Observable<Article[]> {
    return this.http
      .get<Article[]>(`${this.apiBase}/articles/byTag?tag=${tag}`, {
        withCredentials: true,
      })
      .pipe(
        map((response: any) => {
          return response.articles;
        })
      );
  }

  getFeed(): Observable<Article[]> {
    return this.http
      .get<Article[]>(`${this.apiBase}/articles/feed`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.articles));
  }
}

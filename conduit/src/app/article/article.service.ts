import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Article, Author } from '../home/home.store';
import { API_URL } from '../app.component';

export interface Comment {
  commentId: string;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Author;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  constructor(
    @Inject(API_URL) private apiBase: string,
    private http: HttpClient
  ) {}

  getArticle(id: string): Observable<Article> {
    return this.http
      .get<Article>(`${this.apiBase}/articles/${id}`, { withCredentials: true })
      .pipe(map((response: any) => response.article));
  }

  comments(articleId: string): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(`${this.apiBase}/articles/${articleId}/comments`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.comments));
  }
}

import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../app.component';

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class EditorService {
  constructor(
    @Inject(API_URL) private apiBase: string,
    private http: HttpClient
  ) {}

  addArticle(articleData: ArticleData) {
    return this.http.post(`${this.apiBase}/articles`, articleData, {
      withCredentials: true,
    });
  }
}

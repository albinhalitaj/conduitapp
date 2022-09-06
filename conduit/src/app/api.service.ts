import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Article, Author } from './home/home.store';
import { API_URL } from './app.component';
import { Profile } from './profile/profile.store';
import { User } from './auth/auth.store';

export interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginForm {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    expiresAt: string;
  };
}

export interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tags: string[];
}

export interface Comment {
  id: string;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Author;
}

export interface UpdateUserForm {
  username: string;
  bio: string;
  image: string;
}

export interface UpdatedUser {
  email: string;
  username: string;
  bio: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    @Inject(API_URL) private apiBase: string,
    private http: HttpClient
  ) {}

  register(form: RegisterForm): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiBase}/user`, form);
  }

  login(form: LoginForm): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBase}/user/login`, form);
  }

  signOut(): Observable<Object> {
    return this.http.delete(`${this.apiBase}/user`);
  }

  addArticle(articleData: ArticleData) {
    return this.http.post(`${this.apiBase}/articles`, articleData);
  }

  updateArticle(slug: string, articleData: ArticleData) {
    return this.http.put(`${this.apiBase}/articles/${slug}`, articleData);
  }

  favoriteArticle(slug: string) {
    return this.http
      .post(`${this.apiBase}/articles/${slug}/favorite`, {})
      .pipe(map((response: any) => response.article));
  }

  unFavoriteArticle(slug: string) {
    return this.http
      .delete(`${this.apiBase}/articles/${slug}/favorite`, {})
      .pipe(map((response: any) => response.article));
  }

  getArticle(id: string): Observable<Article> {
    return this.http
      .get<Article>(`${this.apiBase}/articles/${id}`)
      .pipe(map((response: any) => response.article));
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiBase}/articles`);
  }

  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiBase}/tags`).pipe(
      map((response: any) => {
        return response.tags;
      })
    );
  }

  getArticlesByTag(tag: string): Observable<Article[]> {
    return this.http
      .get<Article[]>(`${this.apiBase}/articles/byTag?tag=${tag}`)
      .pipe(
        map((response: any) => {
          return response.articles;
        })
      );
  }

  getFavorited(username: string): Observable<Article[]> {
    return this.http
      .get<Article[]>(`${this.apiBase}/articles/byFavorite?author=${username}`)
      .pipe(map((response: any) => response.articles));
  }

  getFeed(): Observable<Article[]> {
    return this.http
      .get<Article[]>(`${this.apiBase}/articles/feed`)
      .pipe(map((response: any) => response.articles));
  }

  comments(articleId: string): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(`${this.apiBase}/articles/${articleId}/comments`)
      .pipe(map((response: any) => response.comments as Comment[]));
  }

  addComment(slug: string, body: string) {
    return this.http
      .post(`${this.apiBase}/articles/${slug}/comments`, body)
      .pipe(map((response: any) => response.comment));
  }

  deleteComment(commentId: string, slug: string) {
    return this.http.delete(
      `${this.apiBase}/articles/${slug}/comments/${commentId}`
    );
  }

  getProfile(username: string) {
    return this.http
      .get<Profile>(`${this.apiBase}/profiles/${username}`)
      .pipe(map((response: any) => response.profile));
  }

  getArticlesByAuthor(username: string) {
    return this.http
      .get<Article[]>(`${this.apiBase}/articles/byAuthor?author=${username}`)
      .pipe(map((response: any) => response.articles));
  }

  followUser(username: string): Observable<Profile> {
    return this.http
      .post<Profile>(`${this.apiBase}/profiles/${username}/follow`, {})
      .pipe(map((response: any) => response.profile));
  }

  unFollowUser(username: string): Observable<Profile> {
    return this.http
      .delete<Profile>(`${this.apiBase}/profiles/${username}/follow`)
      .pipe(map((response: any) => response.profile));
  }

  updateUser(user: UpdateUserForm): Observable<UpdatedUser> {
    return this.http
      .put(`${this.apiBase}/user`, user)
      .pipe(map((response: any) => response.user));
  }

  get(): Observable<User> {
    return this.http
      .get(`${this.apiBase}/user`)
      .pipe(map((response: any) => response.user));
  }
}

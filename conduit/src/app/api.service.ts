import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
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
  id: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string;
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

  signOut(): Observable<any> {
    return this.http.delete(`${this.apiBase}/user`);
  }

  addArticle(articleData: ArticleData) {
    return this.http.post(`${this.apiBase}/articles`, articleData);
  }

  deleteArticle(slug: string) {
    return this.http.delete(`${this.apiBase}/articles/${slug}`);
  }

  updateArticle(slug: string, articleData: ArticleData) {
    return this.http.put(`${this.apiBase}/articles/${slug}`, articleData);
  }

  favoriteArticle(slug: string): Observable<Article> {
    return this.http.post<Article>(`${this.apiBase}/articles/${slug}/favorite`, {});
  }

  unFavoriteArticle(slug: string): Observable<Article> {
    return this.http.delete<Article>(`${this.apiBase}/articles/${slug}/favorite`, {});
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiBase}/articles/${id}`);
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiBase}/articles`);
  }

  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiBase}/tags`);
  }

  getArticlesByTag(tag: string): Observable<Article[]> {
    return this.http.get<Article[]>(
      `${this.apiBase}/articles/byTag?tag=${tag}`
    );
  }

  getFavorited(username: string): Observable<Article[]> {
    return this.http.get<Article[]>(
      `${this.apiBase}/articles/byFavorite?author=${username}`
    );
  }

  getFeed(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiBase}/articles/feed`);
  }

  comments(articleId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.apiBase}/articles/${articleId}/comments`
    );
  }

  addComment(slug: string, body: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiBase}/articles/${slug}/comments`,
      body
    );
  }

  deleteComment(commentId: string, slug: string) {
    return this.http.delete(`${this.apiBase}/articles/${slug}/comments/${commentId}`);
  }

  getProfile(username: string) {
    return this.http.get<Profile>(`${this.apiBase}/profiles/${username}`);
  }

  getArticlesByAuthor(username: string) {
    return this.http.get<Article[]>(`${this.apiBase}/articles/byAuthor?author=${username}`);
  }

  followUser(username: string): Observable<Profile> {
    return this.http.post<Profile>(`${this.apiBase}/profiles/${username}/follow`, {});
  }

  unFollowUser(username: string): Observable<Profile> {
    return this.http.delete<Profile>(`${this.apiBase}/profiles/${username}/follow`);
  }

  updateUser(user: UpdateUserForm): Observable<UpdatedUser> {
    return this.http.put<UpdatedUser>(`${this.apiBase}/user`, user);
  }

  get(): Observable<User> {
    return this.http.get<User>(`${this.apiBase}/user`);
  }

  emailExists(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiBase}/user/emailexists`, { email });
  }
}

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
  commentId: string;
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
    return this.http.post<LoginResponse>(`${this.apiBase}/user/login`, form, {
      withCredentials: true,
    });
  }

  signOut(): Observable<Object> {
    return this.http.delete(`${this.apiBase}/user`, { withCredentials: true });
  }

  addArticle(articleData: ArticleData) {
    return this.http.post(`${this.apiBase}/articles`, articleData, {
      withCredentials: true,
    });
  }

  getArticle(id: string): Observable<Article> {
    return this.http
      .get<Article>(`${this.apiBase}/articles/${id}`, { withCredentials: true })
      .pipe(map((response: any) => response.article));
  }

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

  getFavorited(username: string): Observable<Article[]> {
    return this.http
      .get<Article[]>(
        `${this.apiBase}/articles/byFavorite?author=${username}`,
        {
          withCredentials: true,
        }
      )
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

  comments(articleId: string): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(`${this.apiBase}/articles/${articleId}/comments`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.comments as Comment[]));
  }

  addComment(slug: string, body: string) {
    return this.http
      .post(`${this.apiBase}/articles/${slug}/comments`, body, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.comment));
  }

  getProfile(username: string) {
    return this.http
      .get<Profile>(`${this.apiBase}/profiles/${username}`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.profile));
  }

  getArticlesByAuthor(username: string) {
    return this.http
      .get<Article[]>(`${this.apiBase}/articles/byAuthor?author=${username}`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.articles));
  }

  followUser(username: string): Observable<Profile> {
    return this.http
      .post<Profile>(
        `${this.apiBase}/profiles/${username}/follow`,
        {},
        { withCredentials: true }
      )
      .pipe(map((response: any) => response.profile));
  }

  unFollowUser(username: string): Observable<Profile> {
    return this.http
      .delete<Profile>(`${this.apiBase}/profiles/${username}/follow`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.profile));
  }

  updateUser(user: UpdateUserForm): Observable<UpdatedUser> {
    return this.http
      .put(`${this.apiBase}/user`, user, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.user));
  }

  get(): Observable<User> {
    return this.http
      .get(`${this.apiBase}/user`, { withCredentials: true })
      .pipe(map((response: any) => response.user));
  }
}

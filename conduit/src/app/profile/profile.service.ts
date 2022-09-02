import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Profile } from './profile.store';
import { API_URL } from '../app.component';
import { map, Observable } from 'rxjs';
import { Article } from '../home/home.store';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(
    @Inject(API_URL) private apiBase: string,
    private http: HttpClient
  ) {}

  getProfile(username: string) {
    return this.http
      .get<Profile>(`${this.apiBase}/profiles/${username}`, {
        withCredentials: true,
      })
      .pipe(map((response: any) => response.profile));
  }

  getArticles(username: string) {
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
}

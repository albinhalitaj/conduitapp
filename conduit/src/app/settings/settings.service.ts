import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '../app.component';
import { User } from '../auth/auth.store';

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
export class SettingsService {
  constructor(
    @Inject(API_URL) private apiBase: string,
    private http: HttpClient
  ) {}

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

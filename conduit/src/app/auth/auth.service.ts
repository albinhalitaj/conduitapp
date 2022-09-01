import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../app.component';
import { Observable } from 'rxjs';
import { User } from './auth.store';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
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
}

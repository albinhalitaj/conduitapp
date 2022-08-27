import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../app.component';

export interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    @Inject(API_URL) private apiBase: string,
    private http: HttpClient
  ) {}

  register(form: RegisterForm) {
    return this.http.post<RegisterForm>(`${this.apiBase}/users`, form);
  }
}

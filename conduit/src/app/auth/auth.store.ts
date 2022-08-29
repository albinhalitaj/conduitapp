import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, defer, EMPTY, Observable, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  isAuthenticated$: Observable<boolean> = this.select(
    (s: AuthState) => s.isAuthenticated
  );
  user$: Observable<User | null> = this.select((s: AuthState) => s.user);
  private refresh = this.effect<void>(
    switchMap(() =>
      defer(() => {
        const user = Cookies.get('user');
        if (!user) {
          return of(null);
        }
        return of(JSON.parse(user) as User);
      }).pipe(
        tap((user: User | null) => {
          if (user) {
            this.setState({ isAuthenticated: true, user });
          }
          this.setState({ isAuthenticated: false, user: null });
        }),
        catchError(() => {
          this.setState({ user: null, isAuthenticated: false });
          return EMPTY;
        })
      )
    )
  );

  constructor(private router: Router) {
    super(initialState);
  }

  init() {
    this.refresh();
  }

  authenticate(urlSegments: string[] = ['/']) {
    this.refresh();
    void this.router.navigate(urlSegments);
  }
}

import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  catchError,
  defer,
  EMPTY,
  exhaustMap,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Router } from '@angular/router';
import Cookies from 'js-cookie';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string;
  bio: string;
  image: string;
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
  signOut = this.effect<void>(
    exhaustMap(() =>
      this.authService.signOut().pipe(
        tapResponse(
          () => {
            Cookies.remove('user');
            void this.router.navigate(['/login']);
          },
          (error) => console.log(error)
        )
      )
    )
  );
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
          } else {
            this.setState({ isAuthenticated: false, user: null });
          }
        }),
        catchError(() => {
          this.setState({ user: null, isAuthenticated: false });
          return EMPTY;
        })
      )
    )
  );

  constructor(private router: Router, private authService: AuthService) {
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

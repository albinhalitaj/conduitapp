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
import { ApiService } from '../api.service';

export interface User {
  Id: string;
  Username: string;
  Email: string;
  Role: string;
  ExpiresAt: string;
  Bio: string;
  Image: string;
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
  readonly isAuthenticated$: Observable<boolean> = this.select(
    (s: AuthState) => s.isAuthenticated
  );

  readonly user$: Observable<User | null> = this.select(
    (s: AuthState) => s.user
  );
  readonly signOut = this.effect<void>(
    exhaustMap(() =>
      this.apiService.signOut().pipe(
        tapResponse(
          () => {
            this.setState({ user: null, isAuthenticated: false });
            void this.router.navigate(['/']);
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
          this.setState({ isAuthenticated: !!user, user });
        }),
        catchError(() => {
          this.setState({ user: null, isAuthenticated: false });
          return EMPTY;
        })
      )
    )
  );

  constructor(private router: Router, private apiService: ApiService) {
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

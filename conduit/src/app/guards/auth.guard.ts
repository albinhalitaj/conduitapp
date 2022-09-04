import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthStore } from '../auth/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanLoad, CanActivate {
  constructor(private authStore: AuthStore, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authStore.isAuthenticated$.pipe(
      map((isAuthenticated: boolean) => {
        if (isAuthenticated) return isAuthenticated;
        return this.router.parseUrl('/');
      })
    );
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    return this.authStore.isAuthenticated$.pipe(
      map((isAuthenticated: boolean) => {
        if (isAuthenticated) return isAuthenticated;
        return this.router.parseUrl('/');
      })
    );
  }
}

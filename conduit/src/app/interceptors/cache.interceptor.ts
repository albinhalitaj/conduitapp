import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpUserEvent,
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

const CACHE_TIME = Date.now() * 60 * 1000;

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<
    string,
    { expireDate: Date; response: HttpResponse<any> }
  >();

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    const cachedResponse = this.cache.get(request.url);

    if (cachedResponse && cachedResponse.expireDate <= new Date()) {
      this.cache.delete(request.url);
      this.sendRequest(request, next);
    }
    return cachedResponse
      ? of(cachedResponse.response)
      : this.sendRequest(request, next);
  }

  private sendRequest(request: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(request).pipe(
      tap(
        (
          event:
            | HttpSentEvent
            | HttpHeaderResponse
            | HttpResponse<any>
            | HttpProgressEvent
            | HttpUserEvent<any>
        ) => {
          if (event instanceof HttpResponse) {
            this.cache.set(request.url, {
              expireDate: new Date(CACHE_TIME),
              response: event,
            });
          }
        }
      )
    );
  }
}

import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AdminActions } from '../../state/admin.actions';
import { environment } from '../../../environments/environment';

// Change this to your real API origin in production.
   const API_ORIGIN = environment.apiOrigin;

// Shared so that simultaneous 401s trigger only ONE refresh call.
let refreshInFlight$: Observable<string> | null = null;

const isAuthEndpoint = (url: string) =>
  url.includes('/auth/login/') || url.includes('/auth/refresh/') || url.includes('/auth/logout/');

const withToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

function refreshAccessToken(auth: AuthService, store: Store): Observable<string> {
  const refresh = auth.refreshToken;

  if (!refresh) {
    store.dispatch(AdminActions.sessionExpired());
    return throwError(() => new Error('No refresh token'));
  }

  if (!refreshInFlight$) {
    refreshInFlight$ = auth.refresh(refresh).pipe(
      tap((res) => auth.saveTokens(res.access, res.refresh)),
      map((res) => res.access),
      catchError((err) => {
        store.dispatch(AdminActions.sessionExpired());
        return throwError(() => err);
      }),
      finalize(() => (refreshInFlight$ = null)),
      shareReplay(1),
    );
  }

  return refreshInFlight$;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const store = inject(Store);
  const platformId = inject(PLATFORM_ID);

  // Server-side rendering: no tokens, nothing to do.
  if (!isPlatformBrowser(platformId)) return next(req);

  // Don't send the token to other sites, and skip the auth endpoints themselves.
  if (!req.url.startsWith(API_ORIGIN) || isAuthEndpoint(req.url)) {
    return next(req);
  }

  return next(withToken(req, auth.accessToken)).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      return refreshAccessToken(auth, store).pipe(
        switchMap((token) => next(withToken(req, token))),
      );
    }),
  );
};

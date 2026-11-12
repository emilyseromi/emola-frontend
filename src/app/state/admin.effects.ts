import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { AdminActions } from './admin.actions';
import { AuthService } from '../core/services/auth.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private auth = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.login),
      exhaustMap(({ credentials }) =>
        this.auth.login(credentials).pipe(
          map((response) => AdminActions.loginSuccess({ response })),
          catchError((err) =>
            of(
              AdminActions.loginFailure({
                error:
                  err.status === 401
                    ? 'Invalid username or password'
                    : 'Something went wrong. Please try again.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AdminActions.loginSuccess),
        tap(({ response }) => {
          this.auth.saveSession(response);
          this.router.navigate(['/admin']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.logout),
      exhaustMap(() => {
        const refresh = this.auth.refreshToken;
        const done$ = of(AdminActions.logoutSuccess());
        if (!refresh) return done$;
        // blacklist the token on the server, but log out locally even if this fails
        return this.auth.logout(refresh).pipe(
          map(() => AdminActions.logoutSuccess()),
          catchError(() => done$),
        );
      }),
    ),
  );

  clearSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AdminActions.logoutSuccess, AdminActions.sessionExpired),
        tap(() => {
          this.auth.clearSession();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}

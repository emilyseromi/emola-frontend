import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { UserService } from '../core/services/user';
import { emolaActions } from './emola.actions';

@Injectable()
export class RegistrationEffects {
  private actions$ = inject(Actions);
  private service = inject(UserService);

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(emolaActions.register),
      exhaustMap(({ value }) =>
        this.service.register(value).pipe(
          map((res) => emolaActions.openModal({ value: true })),
          catchError((err) =>
            of(
              emolaActions.registerFailure({
                value: 'Something went wrong, please try again later',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, LoginResponse } from '../shared/models';

export const AdminActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponse }>(),
    'Login Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout Success': emptyProps(),

    'Session Expired': emptyProps(),
  },
});

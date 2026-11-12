import { createFeature, createReducer, on } from '@ngrx/store';
import { User } from '../shared/models';
import { authStorage } from '../shared/auth.storage';
import { AdminActions } from './admin.actions';


export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const loggedOutState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

function getInitialState(): AuthState {
  const user = authStorage.getUser();
  const hasToken = !!authStorage.getAccess();
  return user && hasToken
    ? { ...loggedOutState, user, isAuthenticated: true }
    : loggedOutState;
}

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    getInitialState(),
    on(AdminActions.login, (state) => ({ ...state, loading: true, error: null })),
    on(AdminActions.loginSuccess, (state, { response }) => ({
      ...state,
      user: response.user,
      isAuthenticated: true,
      loading: false,
      error: null,
    })),
    on(AdminActions.loginFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(
      AdminActions.logoutSuccess,
      AdminActions.sessionExpired,
      (): AuthState => loggedOutState
    )
  ),
});

export const {
  selectUser,
  selectIsAuthenticated,
  selectLoading,
  selectError,
} = authFeature;
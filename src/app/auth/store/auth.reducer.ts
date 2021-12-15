import { Action, createReducer, on } from '@ngrx/store';
import { User } from '../user.model';
import {
  authenticateFail,
  authenticateSuccess,
  clearError,
  loginStart,
  logout,
  signupStart,
} from './auth.actions';

export interface State {
  user: User;
  authError: string;
  loading: boolean;
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false,
};

const _authReducer = createReducer(
  initialState,

  on(loginStart, signupStart, (state) => ({
    ...state,
    authError: null,
    loading: true,
  })),

  on(authenticateSuccess, (state, action) => ({
    ...state,
    authError: null,
    loading: false,
    user: new User(
      action.email,
      action.userId,
      action.token,
      action.expirationDate
    ),
  })),

  on(authenticateFail, (state, action) => ({
    ...state,
    user: null,
    authError: action.errorMessage,
    loading: false,
  })),

  on(logout, (state) => ({
    ...state,
    user: null,
  })),

  on(clearError, (state) => ({
    ...state,
    authError: null,
  }))
);

export function authReducer(state: State, action: Action) {
  return _authReducer(state, action);
}

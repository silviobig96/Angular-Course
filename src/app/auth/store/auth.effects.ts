import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import {
  AuthenticateFail,
  AuthenticateSuccess,
  AUTHENTICATE_SUCCESS,
  AUTO_LOGIN,
  LoginStart,
  LOGIN_START,
  LOGOUT,
  SignupStart,
  SIGNUP_START,
} from './auth.actions';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (
  expiresIn: number,
  email: string,
  userId: string,
  token: string
) => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('UserData', JSON.stringify(user));
  return new AuthenticateSuccess({
    email,
    userId,
    token,
    expirationDate,
    redirect: true,
  });
};

const handleError = (errorResponse: any) => {
  let errorMessage = 'An unknown error occurred!';
  if (!errorResponse.error || !errorResponse.error.error) {
    return of(new AuthenticateFail(errorMessage));
  }
  switch (errorResponse.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email exists already';
      break;

    case 'EMAIL_NOT_FOUND':
      errorMessage = 'Credentials error';
      break;

    case 'INVALID_PASSWORD':
      errorMessage = 'Wrong credentials';
      break;

    default:
      break;
  }
  return of(new AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
  @Effect()
  authSignup = this.actions$.pipe(
    ofType(SIGNUP_START),
    switchMap((signupAction: SignupStart) => {
      return this.http
        .post<AuthResponseData>(
          'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
            environment.firebaseAPIKey,
          {
            email: signupAction.payload.email,
            password: signupAction.payload.password,
            returnSecureToken: true,
          }
        )
        .pipe(
          tap((resData) => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
          }),
          map((resData) => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken
            );
          }),
          catchError((errorResponse) => {
            return handleError(errorResponse);
          })
        );
    })
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(LOGIN_START),
    switchMap((authData: LoginStart) => {
      return this.http
        .post<AuthResponseData>(
          'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
            environment.firebaseAPIKey,
          {
            email: authData.payload.email,
            password: authData.payload.password,
            returnSecureToken: true,
          }
        )
        .pipe(
          tap((resData) => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000);
          }),
          map((resData) => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken
            );
          }),
          catchError((errorResponse) => {
            return handleError(errorResponse);
          })
        );
    })
  );

  @Effect({ dispatch: false })
  authRedirect = this.actions$.pipe(
    ofType(AUTHENTICATE_SUCCESS),
    tap((authSuccessAction: AuthenticateSuccess) => {
      if (authSuccessAction.payload.redirect) {
        this.router.navigate(['/']);
      }
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AUTO_LOGIN),
    map(() => {
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(localStorage.getItem('UserData'));

      if (!userData) {
        return { type: 'DUMMY' };
      }

      const loadedUser = new User(
        userData.email,
        userData.id,
        userData._token,
        new Date(userData._tokenExpirationDate)
      );

      if (loadedUser.token) {
        const expirationDuration =
          new Date(userData._tokenExpirationDate).getTime() -
          new Date().getTime();
        // this.autoLogout(expirationDuration);

        this.authService.setLogoutTimer(expirationDuration);
        return new AuthenticateSuccess({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expirationDate: new Date(userData._tokenExpirationDate),
          redirect: false,
        });
      }
      return { type: 'DUMMY' };
    })
  );

  @Effect({ dispatch: false })
  authLogout = this.actions$.pipe(
    ofType(LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('UserData');
      this.router.navigate(['/auth']);
    })
  );

  constructor(
    private readonly actions$: Actions,
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}
}

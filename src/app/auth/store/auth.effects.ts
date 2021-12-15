import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import {
  authenticateFail,
  authenticateSuccess,
  autoLogin,
  loginStart,
  logout,
  signupStart,
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
  return authenticateSuccess({
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
    return of(authenticateFail({ errorMessage }));
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
  return of(authenticateFail({ errorMessage }));
};

@Injectable()
export class AuthEffects {
  authSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signupStart),
      switchMap((action) => {
        return this.http
          .post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
              environment.firebaseAPIKey,
            {
              email: action.email,
              password: action.password,
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
    )
  );

  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginStart),
      switchMap((action) => {
        return this.http
          .post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
              environment.firebaseAPIKey,
            {
              email: action.email,
              password: action.password,
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
    )
  );

  authRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authenticateSuccess),
        tap((action) => action.redirect && this.router.navigate(['/']))
      ),
    { dispatch: false }
  );

  autoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(autoLogin),
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

          this.authService.setLogoutTimer(expirationDuration);
          return authenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false,
          });
        }
        return { type: 'DUMMY' };
      })
    )
  );

  authLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          this.authService.clearLogoutTimer();
          localStorage.removeItem('UserData');
          this.router.navigate(['/auth']);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}
}

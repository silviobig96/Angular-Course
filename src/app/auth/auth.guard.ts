import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { AppState } from '../store/app.reducer';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly store: Store<AppState>
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('auth').pipe(
      take(1),
      map((authState) => {
        return authState.user;
      }),
      map((user) => {
        const isAuth = !!user;
        if (isAuth) {
          return true;
        }
        return this.router.createUrlTree(['/auth']);
      })
      //   tap((isAuth) => {
      //     if (!isAuth) {
      //       this.router.navigate['/auth'];
      //     }
      //   })
    );
  }
}

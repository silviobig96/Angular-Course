import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import { logout } from '../auth/store/auth.actions';
import { storeRecipes, fetchRecipes } from '../recipes/store/recipe.actions';
import { AppState } from '../store/app.reducer';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;
  collapsed = true;

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    this.userSub = this.store
      .select('auth')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
      });
  }

  onSaveData() {
    this.store.dispatch(storeRecipes());
  }

  onFectchData() {
    this.store.dispatch(fetchRecipes());
  }

  onLogout() {
    this.store.dispatch(logout());
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}

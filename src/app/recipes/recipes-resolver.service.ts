import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { AppState } from '../store/app.reducer';
import { Recipe } from './recipe.model';
import { FetchRecipes, SET_RECIPES } from './store/recipe.actions';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private readonly store: Store<AppState>,
    private readonly actions$: Actions
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Recipe[]> | Recipe[] {
    return this.store.select('recipes').pipe(
      take(1),
      map((recipesState) => recipesState.recipes),
      switchMap((recipes) => {
        if (recipes.length === 0) {
          this.store.dispatch(new FetchRecipes());
          return this.actions$.pipe(ofType(SET_RECIPES), take(1));
        } else {
          return of(recipes);
        }
      })
    );
  }
}

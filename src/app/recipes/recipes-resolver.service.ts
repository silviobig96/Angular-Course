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
import { fetchRecipes, setRecipes } from './store/recipe.actions';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<{ recipes: Recipe[] }> {
  constructor(
    private readonly store: Store<AppState>,
    private readonly actions$: Actions
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    return this.store.select('recipes').pipe(
      take(1),
      map((recipesState) => recipesState.recipes),
      switchMap((recipes) => {
        if (recipes.length === 0) {
          this.store.dispatch(fetchRecipes());
          return this.actions$.pipe(ofType(setRecipes), take(1));
        } else {
          return of(recipes);
        }
      })
    );
  }
}

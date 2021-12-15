import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs';
import { AppState } from 'src/app/store/app.reducer';
import { Recipe } from '../recipe.model';
import { fetchRecipes, setRecipes, storeRecipes } from './recipe.actions';

@Injectable()
export class RecipeEffects {
  fetchRecipes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchRecipes),
      switchMap(() => {
        return this.http.get<Recipe[]>(
          'https://recipes-project-ae4fb-default-rtdb.firebaseio.com/recipes.json'
        );
      }),
      map((recipes) => {
        return recipes.map((recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      map((recipes) => {
        return setRecipes({ recipes });
      })
    )
  );

  storeRecipes$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(storeRecipes),
        withLatestFrom(this.store.select('recipes')),
        switchMap(([actionData, recipesState]) => {
          return this.http.put(
            'https://recipes-project-ae4fb-default-rtdb.firebaseio.com/recipes.json',
            recipesState.recipes
          );
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private readonly http: HttpClient,
    private readonly store: Store<AppState>
  ) {}
}

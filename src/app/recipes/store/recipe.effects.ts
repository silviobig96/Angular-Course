import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs';
import { AppState } from 'src/app/store/app.reducer';
import { Recipe } from '../recipe.model';
import { FETCH_RECIPES, SetRecipes, STORE_RECIPES } from './recipe.actions';

@Injectable()
export class RecipeEffects {
  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(FETCH_RECIPES),
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
      return new SetRecipes(recipes);
    })
  );

  @Effect({ dispatch: false })
  storeRecipe = this.actions$.pipe(
    ofType(STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([actionData, recipesState]) => {
      return this.http.put(
        'https://recipes-project-ae4fb-default-rtdb.firebaseio.com/recipes.json',
        recipesState.recipes
      );
    })
  );

  constructor(
    private actions$: Actions,
    private readonly http: HttpClient,
    private readonly store: Store<AppState>
  ) {}
}

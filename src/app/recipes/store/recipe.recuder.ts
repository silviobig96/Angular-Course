import { Action, createReducer, on } from '@ngrx/store';
import { Recipe } from '../recipe.model';
import {
  addRecipe,
  updateRecipe,
  deleteRecipe,
  setRecipes,
} from './recipe.actions';

export interface State {
  recipes: Recipe[];
}

const initialState: State = {
  recipes: [],
};
const _recipeReducer = createReducer(
  initialState,

  on(addRecipe, (state, action) => ({
    ...state,
    recipes: state.recipes.concat({ ...action.recipe }),
  })),

  on(updateRecipe, (state, action) => ({
    ...state,
    recipes: state.recipes.map((recipe, index) =>
      index === action.index ? { ...action.recipe } : recipe
    ),
  })),

  on(deleteRecipe, (state, action) => ({
    ...state,
    recipes: state.recipes.filter((_, index) => index !== action.index),
  })),

  on(setRecipes, (state, action) => ({
    ...state,
    recipes: [...action.recipes],
  }))
);

export function recipeReducer(state: State, action: Action) {
  return _recipeReducer(state, action);
}

import { Action, createReducer, on } from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';
import {
  addIngredient,
  addIngredients,
  updateIngredient,
  deleteIngredient,
  startEdit,
  stopEdit,
} from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient;
  editedIngredientIndex: number;
}

const initialState: State = {
  ingredients: [
    new Ingredient('Apples', 2),
    { name: 'oregan leaves', amount: 8 },
  ],
  editedIngredient: null,
  editedIngredientIndex: -1,
};

const _shoppingListReducer = createReducer(
  initialState,

  on(addIngredient, (state, action) => ({
    ...state,
    ingredients: state.ingredients.concat(action.ingredient),
  })),

  on(addIngredients, (state, action) => ({
    ...state,
    ingredients: state.ingredients.concat(...action.ingredients),
  })),

  on(updateIngredient, (state, action) => ({
    ...state,
    editedIngredientIndex: -1,
    ingredients: state.ingredients.map((ingredient, index) =>
      index === state.editedIngredientIndex
        ? { ...action.ingredient }
        : ingredient
    ),
    editedIngredient: null,
  })),

  on(deleteIngredient, (state) => ({
    ...state,
    editedIngredientIndex: -1,
    ingredients: state.ingredients.filter(
      (_, index) => index !== state.editedIngredientIndex
    ),
    editedIngredient: null,
  })),

  on(startEdit, (state, action) => ({
    ...state,
    editedIngredientIndex: action.index,
    editedIngredient: { ...state.ingredients[action.index] },
  })),

  on(stopEdit, (state) => ({
    ...state,
    editedIngredientIndex: -1,
    editedIngredient: null,
  }))
);

export function shoppingListReducer(state: State, action: Action) {
  return _shoppingListReducer(state, action);
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs';
import { AddIngredients } from 'src/app/shopping-list/store/shopping-list.actions';
import { AppState } from 'src/app/store/app.reducer';
import { Recipe } from '../recipe.model';
import { DeleteRecipe } from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((params) => {
          return +params['id'];
        }),
        switchMap((id) => {
          this.id = id;
          return this.store.select('recipes');
        }),
        map((recipeState) => {
          return recipeState.recipes.find((recipe, index) => {
            return index === this.id;
          });
        })
      )
      .subscribe((recipe) => {
        this.recipe = recipe;
      });
  }

  onAddShoppingList() {
    this.store.dispatch(new AddIngredients(this.recipe.ingredients));
  }

  onEditRecipe() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onDeleteRecipe() {
    this.store.dispatch(new DeleteRecipe(this.id));
    this.router.navigate(['/recipes']);
  }
}

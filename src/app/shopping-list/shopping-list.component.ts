import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { LogginService } from '../logging.service';
import { Ingredient } from '../shared/ingredient.model';
import { StartEdit } from './store/shopping-list.actions';
import * as fromApp from '../store/app.reducer';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Observable<{ ingredients: Ingredient[] }>;
  // private subscription: Subscription;

  constructor(
    private readonly logginService: LogginService,
    private readonly store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList');

    // this.ingredients = this.slService.getIngredients();
    // this.subscription = this.slService.ingredientsChanged.subscribe(
    //   (ingredients: Ingredient[]) => {
    //     this.ingredients = ingredients;
    //   }
    // );

    this.logginService.printLog('Hello from shopping list component ');
  }

  onEditItem(index: number) {
    // this.slService.startedEditing.next(index);
    this.store.dispatch(new StartEdit(index));
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
}

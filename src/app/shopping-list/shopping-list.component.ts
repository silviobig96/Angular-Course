import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { LogginService } from '../logging.service';
import { Ingredient } from '../shared/ingredient.model';
import * as fromApp from '../store/app.reducer';
import { startEdit } from './store/shopping-list.actions';

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

    this.logginService.printLog('Hello from shopping list component ');
  }

  onEditItem(index: number) {
    this.store.dispatch(startEdit({ index }));
  }

  ngOnDestroy(): void {}
}

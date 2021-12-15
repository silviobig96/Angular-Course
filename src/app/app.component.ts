import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthService } from './auth/auth.service';
import { AutoLogin } from './auth/store/auth.actions';
import { LogginService } from './logging.service';
import { AppState } from './store/app.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly store: Store<AppState>,
    private readonly logginService: LogginService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(new AutoLogin());
    this.logginService.printLog('Hello from App Component');
  }
}

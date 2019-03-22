import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingData, ErrorData, AppDuck } from './ducks-v-2/app.duck';
import { UserDuck } from './ducks-v-2/user.duck';
import { StorageDuck } from './ducks-v-2/storage.duck';
import { Correlation } from 'src/ducks-v-2/classes/correlation';
import { UiDuck } from './ducks-v-2/ui.duck';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ready$: Observable<boolean> = this.app.store.ready;
  loading$: Observable<boolean> = this.app.store.loading;
  loadingData$: Observable<LoadingData[]> = this.app.store.loadingData;
  error$: Observable<boolean> = this.app.store.error;
  errorData$: Observable<ErrorData[]> = this.app.store.errorData;

  showHeader$: Observable<boolean> = this.ui.store.showHeader;

  constructor(
    public storage: StorageDuck,
    public user: UserDuck,
    public app: AppDuck,
    public ui: UiDuck,
  ) {
  }

  ngOnInit() {
    const fromComponent = new Correlation('AppComponent@constructor');
    this.app.actions.initializeRequest.dispatch(undefined, [fromComponent]);
  }

  clearError() {
    const fromComponent = new Correlation('AppComponent@clearError');
    this.app.actions.clearError.dispatch(undefined, [fromComponent]);
  }

}


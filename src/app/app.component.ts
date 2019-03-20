import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageDuck } from './ducks/storage.duck';
import { UserDuck } from './ducks/user.duck';
import { AppDuck, AppLoadingData, AppErrorData } from './ducks/app.duck';
import { test } from '../ducks/decorators/duck';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  ready$: Observable<boolean> = this.app.store.selectors.ready;
  loading$: Observable<boolean> = this.app.store.selectors.loading;
  loadingData$: Observable<AppLoadingData[]> = this.app.store.selectors.loadingData;
  error$: Observable<boolean> = this.app.store.selectors.error;
  errorData$: Observable<AppErrorData[]> = this.app.store.selectors.errorData;

  constructor(
    public storageD: StorageDuck,
    public userD: UserDuck,
    public app: AppDuck,
  ) {
    this.app.actions.initializeRequest.dispatch(undefined);
    test();
  }

}


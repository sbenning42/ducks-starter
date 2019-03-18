import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageDuck } from './ducks/storage.duck';
import { UserDuck } from './ducks/user.duck';
import { AppDuck, AppLoadingData, AppErrorData } from './ducks/app.duck';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  ready$: Observable<boolean> = this.app.storeManager.selectors.ready;
  loading$: Observable<boolean> = this.app.storeManager.selectors.loading;
  loadingData$: Observable<AppLoadingData[]> = this.app.storeManager.selectors.loadingData;
  error$: Observable<boolean> = this.app.storeManager.selectors.error;
  errorData$: Observable<AppErrorData[]> = this.app.storeManager.selectors.errorData;

  constructor(
    public storageD: StorageDuck,
    public userD: UserDuck,
    public app: AppDuck,
  ) {
    this.app.actionsManager.initializeRequest.dispatch(undefined);
  }

}


import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingData, ErrorData, AppDuck } from './ducks-v-2/app.duck';
import { UserDuck } from './ducks-v-2/user.duck';
import { StorageDuck } from './ducks-v-2/storage.duck';
import { Correlation } from 'src/ducks-v-2/classes/correlation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  ready$: Observable<boolean> = this.app.store.ready;
  loading$: Observable<boolean> = this.app.store.loading;
  loadingData$: Observable<LoadingData[]> = this.app.store.loadingData;
  error$: Observable<boolean> = this.app.store.error;
  errorData$: Observable<ErrorData[]> = this.app.store.errorData;

  constructor(
    public storage: StorageDuck,
    public user: UserDuck,
    public app: AppDuck,
  ) {
    const fromComponent = new Correlation('AppComponent@constructor');
    this.app.actions.initializeRequest.dispatch(undefined, [fromComponent]);
  }

}


import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageBone } from './bones/storage.bone';
import { AppBone, AppLoadingData, AppErrorData } from './bones/app.bone';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app';
  ready$: Observable<boolean> = this.app.selectors.ready;
  loading$: Observable<boolean> = this.app.selectors.loading;
  loadingData$: Observable<AppLoadingData[]> = this.app.selectors.loadingData;
  error$: Observable<AppErrorData[]> = this.app.selectors.errorData;

  constructor(
    public storage: StorageBone,
    public app: AppBone
  ) {
    app.actions.initializeRequest.dispatch(undefined);
  }

}


import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MaestroFacade } from 'src/maestro/store/maestro.facade';
import { AppStoreConfig } from './stores/app/app.store-config';
import { BaseStore } from 'src/maestro/factories/base-store-m';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  app: BaseStore;
  ready$: Observable<boolean>;
  loading$: Observable<boolean>;
  loadingData$: Observable<any>;
  error$: Observable<Error>;

  constructor(
    public maestro: MaestroFacade,
    public appStoreConfig: AppStoreConfig
  ) {
    this.initialize();
  }

  initialize() {
    this.maestro.registerStoreConfig(this.appStoreConfig);
    this.app = this.maestro.getStore('app');
    this.ready$ = this.app.ready$;
    this.loading$ = this.app.loading$.pipe(tap(c => console.log('loading: ', c)));
    this.loadingData$ = this.app.loadingData$;
    this.error$ = this.app.error$;
    this.app.initialize();
  }


}

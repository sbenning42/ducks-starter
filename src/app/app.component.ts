import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MaestroFacade } from 'src/maestro/store/maestro.facade';
import { BaseStore } from 'src/maestro/factories/base-store-m';
import { Ducks } from 'src/ducks/ducks';
import { StorageDuck } from 'src/ducks/storage/storage.duck';


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
    public ducks: Ducks,
    public storage: StorageDuck
  ) {
    this.initialize();
  }

  initialize() {
    this.ducks.registerDuck(this.storage);
    // this.storage.actions.getStorage.dispatch();
    this.storage.actions.saveStorage.dispatch({ entries: { test: 'Tested !!!' } });
  }


}

import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppDuck } from 'src/ducks/app/app.duck';
import { StorageDuck, StorageEntries } from 'src/ducks/storage/storage.duck';
import { filter, first } from 'rxjs/operators';
import { Ducks } from '../ducks/ducks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app';
  ready$: Observable<boolean> = this.app.selectors.ready;
  loading$: Observable<boolean> = this.app.selectors.loading;
  loadingData$: Observable<any[]> = this.app.selectors.loadingData;
  error$: Observable<Error[]> = this.app.selectors.errorData;

  constructor(
    public app: AppDuck,
    public storage: StorageDuck,
    public ducks: Ducks
  ) {
    this.initialize();
  }

  initialize() {
    // Make Ducks to register all registered duck's action effects 
    this.ducks.start();

    /*
  
    this.storage.actions.getStorage.dispatch();
    this.storage.selectors.entries.pipe(
      filter((entries: StorageEntries) => !!entries),
      first(),
    ).subscribe((entries: StorageEntries) => {
      console.log(entries);
      this.app.actions.initialize.dispatch();
    });

    */

    const getStorage = this.storage.actions.getStorage.factory();
    const finish$ = this.ducks.asyncFinish(getStorage);

    finish$.subscribe((withValue: any) => {
      console.log('Get Storage finish with value: ', withValue);
    });

    this.storage.dispatch(getStorage);
  }

}


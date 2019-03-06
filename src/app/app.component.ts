import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppDuck } from 'src/ducks/app/app.duck';
import { StorageDuck, StorageEntries } from 'src/ducks/storage/storage.duck';
import { filter, first } from 'rxjs/operators';

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
  ) {
    this.initialize();
  }

  initialize() {
    this.storage.actions.getStorage.dispatch();
    this.storage.selectors.entries.pipe(
      // filter((entries: StorageEntries) => !!entries),
      first(),
    ).subscribe((entries: StorageEntries) => {
      console.log(entries);
      this.app.actions.initialize.dispatch();
    });
  }

}

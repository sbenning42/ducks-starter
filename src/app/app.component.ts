import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageBone } from './bones/storage.bone';
import { AppBone } from './bones/app.bone';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app';
  ready$: Observable<boolean>;
  loading$: Observable<boolean>;
  loadingData$: Observable<any[]>;
  error$: Observable<Error[]>;

  constructor(
    public storage: StorageBone,
    public app: AppBone
  ) {
    app.bone.actions.initializeRequest.dispatch(undefined);
  }
 
}


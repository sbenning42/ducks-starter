import { Component } from '@angular/core';
import { Observable, of, merge, defer } from 'rxjs';
import { StorageBone } from './bones/storage.bone';
import { AppBone, AppLoadingData, AppErrorData } from './bones/app.bone';
import { UserBone } from './bones/user.bone';
import { first, map, filter, mergeMap, tap } from 'rxjs/operators';
import { CorrelationBGL } from 'src/beagle/classes/correlation-bgl';
import { BeagleService } from 'src/beagle/beagle.service';
import { makeRequestTypeBGL, BeagleSym, AsyncActionFactoryBGL } from 'src/beagle/classes/async-actions-factory-bgl';
import { ActionBGL } from 'src/beagle/classes/action-bgl';
import { BoneBGL } from 'src/beagle/classes/bone-bgl';
import { StorageDuck } from './ducks/storage.duck';
import { UserDuck } from './ducks/user.duck';
import { AppDuck } from './ducks/app.duck';


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

  loadingActions$ = defer(() => {
    /*
    let loadingActions = [];
    const findAsync = (action: ActionBGL<any>) => action.correlations && action.correlations
      .find(correlation => correlation.type === 'async');
    const asyncBeagleActions$ = this.beagle.actions$.pipe(
      filter(action => action.type.includes(BeagleSym.beagle)),
    );
    const asyncBeagleRequests$ = asyncBeagleActions$.pipe(filter(action => action.type.includes(BeagleSym.request)));
    const asyncBeagleOthers$ = asyncBeagleActions$.pipe(filter(action => !action.type.includes(BeagleSym.request)));
    return merge(
      asyncBeagleOthers$.pipe(
        map((response: ActionBGL<any>) => {
          const async = findAsync(response);
          loadingActions = loadingActions.filter(loading => loading.async.id !== async.id);
          return loadingActions;
        }),
      ),
      asyncBeagleRequests$.pipe(
        map((request: ActionBGL<any>) => {
          const bone = this.beagle.getBoneOf<BoneBGL<{}, {}>>(request);
          if (bone) {
            loadingActions.push({
              request,
              factory: bone.getActionFactory(request),
              async: findAsync(request)
            });
          }
          return loadingActions;
        }),
      ),
    );
    */
  });

  constructor(
    public storageD: StorageDuck,
    public userD: UserDuck,
    public app: AppDuck,
  ) {
    this.app.actionsManager.initializeRequest.dispatch(undefined);
  }

  eraseErrors(datas: AppErrorData[]) {
    /*
    const correlation = new CorrelationBGL('AppComponent@eraseErrors');
    this.app.dispatch(...datas.map(() => this.app.actions.stopError.create(undefined, [correlation])));
    */
  }

  cancelAll(
    actions: { request: ActionBGL<any>, async: CorrelationBGL, factory: AsyncActionFactoryBGL<any, any> }[]
  ) {
    /*
    console.log('AppComponent@cancelAll: ', actions);
    const correlation = new CorrelationBGL('AppComponent@cancelAll');
    this.beagle.dispatch(
      ...actions.map(action => action.factory.createCancel(action.request, [correlation]))
    );
    */
  }

}


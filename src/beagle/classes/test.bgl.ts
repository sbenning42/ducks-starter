import { ActionConfigBGL } from './action-config-bgl';
import { of, concat, from, zip, merge } from 'rxjs';
import { Beagle, SchemaBGL } from './beagle';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { ActionFactoryBGL } from './action-factory-bgl';
import { AsyncActionFactoryBGL, makeResolvedTypeBGL, ofResolvedType } from './async-actions-factory-bgl';
import { Actions, ofType } from '@ngrx/effects';
import { mergeMap, filter, map } from 'rxjs/operators';
import { ActionBGL } from './action-bgl';
import { StorageService } from 'src/app/services/storage/storage.service';
import * as uuid from 'uuid/v4';

/** In those exemple, interfaces are defined to simplify generics type definitions. */

interface SyncActionPayload {
  test: string;
}
interface AsyncActionPayload {
  test: string;
}
interface AsyncActionResult {
  tested: string;
}

interface ActionsSchema extends SchemaBGL {
  sync: [SyncActionPayload, void];
  async: [AsyncActionPayload, AsyncActionResult];
  action1: [AsyncActionPayload, AsyncActionResult];
  action2: [AsyncActionPayload, AsyncActionResult];
  action3: [AsyncActionPayload, AsyncActionResult];
  get: [undefined, AsyncActionResult];
  save: [AsyncActionPayload, AsyncActionResult];
}

@Injectable()
export class TestBGL {
  factories: {
    sync: ActionFactoryBGL<SyncActionPayload>;
    async: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
    action1: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
    action2: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
    action3: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
    get: AsyncActionFactoryBGL<undefined, AsyncActionResult>;
    save: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
  };
  constructor(
    public store: Store<any>,
    public actions$: Actions,
    public storage: StorageService,
  ) {
  }

  test() {
    /** Instanciate Beagle singleton */
    const beagle = new Beagle(this.store, this.actions$);

    /** Two method for defining an Action factory: createActionFactory or createActionFactories */

    /**
     * createActionFactory take an ActionConfigBGL as parameter,
     * - if 'async' is found in the actionConfig correlation array it return an AsyncActionFactoryBGL.
     * - if 'async' is not found in the actionConfig correlation array it return an ActionFactoryBGL.
     * In order to get a strong typed output, createActionFactory might take one or two generics type:
     * - if the handler is synchronous, pass the handler payload type as first generics.
     * - if the handler is asynchronous, pass the handler payload type as first generics, and it's result type as second generics.
    */

    /*
    const bSyncFactory = beagle.createActionFactory<SyncActionPayload>(
      new ActionConfigBGL('syncAction', [], payload => console.log(payload))
    );
    const bAsyncFactory = beagle.createActionFactory<AsyncActionPayload, AsyncActionResult>(
      new ActionConfigBGL('asyncAction', ['async'], payload => of({ tested: `${payload.test} tested !!!` }))
    );

    const bSyncAction = bSyncFactory.create({ test: 'Hello Beagle !!!' });
    const bAsyncRequestAction = bAsyncFactory.createRequest({ test: 'Hello Async Beagle !!!' });
    const bAsyncCancelAction = bAsyncFactory.createCancel(bAsyncRequestAction);

    console.log(bSyncAction, bAsyncRequestAction, bAsyncCancelAction);
    */

    /**
     * createActionFactories take an ActionConfigBGL map as parameter,
     * it return a map of createActionFactory call.
     * In order to get a strong typed output, createActionFactories should take one generics type:
     * - the generics should be a map with the same keys of createActionFactories parameter,
     *    and associated with each, an array of one or two generics type, depending if the action handler is synchronous or asynchronous.
     */
    const sync = new ActionConfigBGL<SyncActionPayload>(
      'syncAction', [], payload => console.log(payload)
    );
    const async = new ActionConfigBGL<AsyncActionPayload, AsyncActionResult>(
      'asyncAction', ['async'], payload => of({ tested: `${payload.test} tested !!!` })
    );
    const action1 = new ActionConfigBGL<AsyncActionPayload, AsyncActionResult>(
      'action 1', ['async', 'effect1', 'effect2'], payload => of({ tested: `[1]: ${payload.test} tested !!!` })
    );
    const action2 = new ActionConfigBGL<AsyncActionPayload, AsyncActionResult>(
      'action 2', ['async'], payload => of({ tested: `[2]: ${payload.test} tested !!!` })
    );
    const action3 = new ActionConfigBGL<AsyncActionPayload, AsyncActionResult>(
      'action 3', ['async'], payload => of({ tested: `[3]: ${payload.test} tested !!!` })
    );
    const get = new ActionConfigBGL<undefined, AsyncActionResult>(
      'get storage', ['async'], () => this.storage.get().pipe(map(result => ({ tested: result })))
    );
    const save = new ActionConfigBGL<AsyncActionPayload, AsyncActionResult>(
      'save storage', ['async'], payload => this.storage.save(payload).pipe(map(result => ({ tested: result })))
    );
    this.factories = beagle.createActionFactories<ActionsSchema>({ sync, async, action1, action2, action3, get, save });

    this.factories.sync.dispatch({ test: 'Hello Beagle !!!' });
    const asyncRequestAction = this.factories.async.createRequest({ test: 'Hello Async Beagle !!!' });
    const asyncCancelAction = this.factories.async.createCancel(asyncRequestAction);

    beagle.createAsyncEffect(async, this.factories.async);
    beagle.createAsyncEffect(action1, this.factories.action1);
    beagle.createAsyncEffect(action2, this.factories.action2);
    beagle.createAsyncEffect(action3, this.factories.action3);
    beagle.createAsyncEffect(get, this.factories.get);
    beagle.createAsyncEffect(save, this.factories.save);

    const asyncActionLifecycle$ = beagle.asyncLifecycle(asyncRequestAction);

    asyncActionLifecycle$.subscribe(console.log, () => {}, () => console.log('Complete !'));

    console.log(asyncRequestAction, asyncCancelAction);

    beagle.store.dispatch(asyncRequestAction);

    const action1Request = this.factories.action1.createRequest({ test: 'action 1' });
    const effect1$ = beagle.asyncLifecycle(action1Request).pipe(
      ofResolvedType(action1Request.type),
      mergeMap((action1Resolved: ActionBGL<AsyncActionResult>) => {
        const effect1Correlation = action1Request.correlations.find(correlation => correlation.type === 'effect1');
        const action2Request = this.factories.action2.createRequest({ test: action1Resolved.payload.tested }, [effect1Correlation]);
        return concat(
          of(action2Request),
          beagle.asyncLifecycle(action2Request).pipe(
            ofResolvedType(action2Request.type),
            map((action2Resolved: ActionBGL<AsyncActionResult>) =>
              this.factories.action3.createRequest({ test: action2Resolved.payload.tested }, [effect1Correlation])
            ),
          )
        );
      })
    );


    const effect2$ = beagle.asyncLifecycle(action1Request).pipe(
      ofResolvedType(action1Request.type),
      mergeMap((action1Resolved: ActionBGL<AsyncActionResult>) => {
        const effect2Correlation = action1Request.correlations.find(correlation => correlation.type === 'effect2');
        const action2Request = this.factories.action2.createRequest({ test: action1Resolved.payload.tested }, [effect2Correlation]);
        const action3Request = this.factories.action3.createRequest({ test: action1Resolved.payload.tested }, [effect2Correlation]);
        return concat(
          from([action2Request, action3Request]),
          zip(
            beagle.asyncLifecycle(action2Request).pipe(ofResolvedType(action2Request.type)),
            beagle.asyncLifecycle(action3Request).pipe(ofResolvedType(action3Request.type)),
          ).pipe(
            map(([action2Resolved, action3Resolved]: [ActionBGL<AsyncActionResult>, ActionBGL<AsyncActionResult>]) =>
              this.factories.sync.create({ test: `${action2Resolved.payload.tested} | ${action3Resolved.payload.tested}` }, [effect2Correlation])
            ),
          )
        );
      }),
    );

    merge(
      effect1$,
      // effect2$,
    ).subscribe(action => beagle.store.dispatch(action));

    beagle.store.dispatch(action1Request);

    const getAction = this.factories.get.createRequest(undefined);
    beagle.store.dispatch(getAction);
    this.factories.save.dispatchRequest({ test: uuid() });

    setTimeout(() => this.factories.get.dispatchCancel(getAction), 2000);
  }
}

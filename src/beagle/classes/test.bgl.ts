import { ActionConfigBGL } from './action-config-bgl';
import { of, concat, from, zip, merge } from 'rxjs';
import { Beagle, SchemaBGL } from './beagle';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { ActionFactoryBGL } from './action-factory-bgl';
import { AsyncActionFactoryBGL, makeResolvedTypeBGL } from './async-actions-factory-bgl';
import { Actions, ofType } from '@ngrx/effects';
import { mergeMap, filter, map } from 'rxjs/operators';
import { ActionBGL } from './action-bgl';

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
  sync: [SyncActionPayload];
  async: [AsyncActionPayload, AsyncActionResult];
  action1: [AsyncActionPayload, AsyncActionResult];
  action2: [AsyncActionPayload, AsyncActionResult];
  action3: [AsyncActionPayload, AsyncActionResult];
}

@Injectable()
export class TestBGL {
  factories: {
    sync: ActionFactoryBGL<SyncActionPayload>;
    async: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
    action1: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
    action2: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
    action3: AsyncActionFactoryBGL<AsyncActionPayload, AsyncActionResult>;
  };
  constructor(public store: Store<any>, public actions$: Actions) {
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
      'action 1', ['async'], payload => of({ tested: `[1]: ${payload.test} tested !!!` })
    );
    const action2 = new ActionConfigBGL<AsyncActionPayload, AsyncActionResult>(
      'action 2', ['async'], payload => of({ tested: `[2]: ${payload.test} tested !!!` })
    );
    const action3 = new ActionConfigBGL<AsyncActionPayload, AsyncActionResult>(
      'action 3', ['async'], payload => of({ tested: `[3]: ${payload.test} tested !!!` })
    );
    this.factories = beagle.createActionFactories<ActionsSchema>({ sync, async, action1, action2, action3 });

    this.factories.sync.dispatch({ test: 'Hello Beagle !!!' });
    const asyncRequestAction = this.factories.async.createRequest({ test: 'Hello Async Beagle !!!' });
    const asyncCancelAction = this.factories.async.createCancel(asyncRequestAction);

    beagle.createAsyncEffect(async, this.factories.async);
    beagle.createAsyncEffect(action1, this.factories.action1);
    beagle.createAsyncEffect(action2, this.factories.action2);
    beagle.createAsyncEffect(action3, this.factories.action3);

    const asyncActionLificycle$ = beagle.asyncLifecycle(asyncRequestAction);

    asyncActionLificycle$.subscribe(console.log, () => {}, () => console.log('Complete !'));

    console.log(asyncRequestAction, asyncCancelAction);

    beagle.store.dispatch(asyncRequestAction);

    const action1Request = this.factories.action1.createRequest({ test: 'action 1' });
    const effect1$ = beagle.asyncLifecycle(action1Request).pipe(
      ofType(makeResolvedTypeBGL(action1.type)),
      mergeMap((action1Resolved: ActionBGL<AsyncActionResult>) => {
        const action2Request = this.factories.action2.createRequest({ test: action1Resolved.payload.tested });
        return concat(
          of(action2Request),
          beagle.asyncLifecycle(action2Request).pipe(
            ofType(makeResolvedTypeBGL(action2.type)),
            mergeMap((action2Resolved: ActionBGL<AsyncActionResult>) => of(
              this.factories.action3.createRequest({ test: action2Resolved.payload.tested })
            )),
          )
        );
      })
    );


    const effect2$ = beagle.asyncLifecycle(action1Request).pipe(
      ofType(makeResolvedTypeBGL(action1.type)),
      mergeMap((action1Resolved: ActionBGL<AsyncActionResult>) => {
        const action2Request = this.factories.action2.createRequest({ test: action1Resolved.payload.tested });
        const action3Request = this.factories.action3.createRequest({ test: action1Resolved.payload.tested });
        return concat(
          from([action2Request, action3Request]),
          zip(
            beagle.asyncLifecycle(action2Request).pipe(ofType(makeResolvedTypeBGL(action2.type))),
            beagle.asyncLifecycle(action3Request).pipe(ofType(makeResolvedTypeBGL(action3.type))),
          ).pipe(
            map(([action2Resolved, action3Resolved]: [ActionBGL<AsyncActionResult>, ActionBGL<AsyncActionResult>]) =>
              this.factories.sync.create({ test: `${action2Resolved.payload.tested} | ${action3Resolved.payload.tested}` })
            ),
          )
        );
      }),
    );

    merge(effect1$, effect2$).pipe(filter(action => !!action)).subscribe(action => beagle.store.dispatch(action));

    beagle.store.dispatch(action1Request);

  }
}

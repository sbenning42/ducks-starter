import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { ActionConfigBGL } from './action-config-bgl';
import {
  AsyncActionFactoryBGL,
  makeRequestTypeBGL,
  makeCancelTypeBGL,
  makeResolvedTypeBGL,
  makeRetryTypeBGL,
  makeErroredTypeBGL,
  makeCanceledTypeBGL
} from './async-actions-factory-bgl';
import { ActionFactoryBGL } from './action-factory-bgl';
import { of, Observable } from 'rxjs';
import { ActionBGL } from './action-bgl';
import { RawStoreConfigBGL } from './raw-store-config-bgl';
import { mergeMap, take, map, catchError, takeUntil, defaultIfEmpty, filter, takeWhile } from 'rxjs/operators';
import { RawStoreBGL } from './raw-store-bgl';

export interface SchemaBGL {
  [key: string]: [any] | [any, any];
}

export class Beagle {
  constructor(
    public store: Store<any>,
    public actions$: Actions,
  ) { }

  private createAsyncEffect<Payload, Result extends Object>(
    config: ActionConfigBGL<Payload, Result>,
    factory: AsyncActionFactoryBGL<Payload, Result>
  ) {
    return this.actions$.pipe(
      ofType(makeRequestTypeBGL(config.type)),
      mergeMap((request: ActionBGL<Payload>) => config.handler(request.payload).pipe(
        map((result: Result) => factory.createResolved(result, request)),
        catchError((error: Error) => of(factory.createErrored(error, request))),
        takeUntil(this.actions$.pipe(ofType(makeCancelTypeBGL(config.type)))),
        defaultIfEmpty(factory.createCanceled(request)),
        take(1)
      ))
    ).subscribe(action => this.store.dispatch(action));
  }

  createActionFactory<Payload, Result extends (Object|void) = void>(
    config: ActionConfigBGL<Payload, Result>
  ): Result extends void ? ActionFactoryBGL<Payload> : AsyncActionFactoryBGL<Payload, Result> {
    const async = config.correlations.some(correlation => correlation === 'async');
    const factory = async ? new AsyncActionFactoryBGL(config, this.store) : new ActionFactoryBGL(config, this.store);
    if (async) {
      this.createAsyncEffect<Payload, any>(config, factory as AsyncActionFactoryBGL<Payload, Result>);
    }
    return factory as Result extends void
      ? ActionFactoryBGL<Payload>
      : AsyncActionFactoryBGL<Payload, Result>;
  }

  createActionFactories<Schema extends SchemaBGL>(
    configs: {
      [Key in keyof Schema]: ActionConfigBGL<Schema[Key][0], Schema[Key][1] extends undefined ? void : Schema[Key][1]>
    }
  ): {
    [Key in keyof Schema]: (Schema[Key][1] extends undefined ? void : Schema[Key][1]) extends void
      ? ActionFactoryBGL<Schema[Key][0]>
      : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>;
    } {
    return Object.keys(configs)
      .reduce((factories, name) => ({
        ...factories,
        [name]: this.createActionFactory(configs[name])
      }), {}) as {
        [Key in keyof Schema]: (Schema[Key][1] extends undefined ? void : Schema[Key][1]) extends void
          ? ActionFactoryBGL<Schema[Key][0]>
          : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>;
        };
  }

  asyncLifecycle<Payload, Result>(request: ActionBGL<Payload>) {
    const isAFinishType = (type: string) => [
      makeResolvedTypeBGL(request.type),
      makeErroredTypeBGL(request.type),
      makeCanceledTypeBGL(request.type),
    ].includes(type);
    const isAsyncCorrelation = (action: ActionBGL<any>) => action.correlations.some(correlation => correlation.type === 'async');
    const grabAsyncCorrelation = (action: ActionBGL<any>) => action.correlations.find(correlation => correlation.type === 'async');
    const compareAsyncCorrelation = (action1: ActionBGL<any>, action2: ActionBGL<any>) =>
      isAsyncCorrelation(action1)
      && isAsyncCorrelation(action2)
      && grabAsyncCorrelation(action1).id === grabAsyncCorrelation(action2).id;
    return this.actions$.pipe(
      ofType(
        makeRequestTypeBGL(request.type),
        makeCancelTypeBGL(request.type),
        makeRetryTypeBGL(request.type),
        makeResolvedTypeBGL(request.type),
        makeErroredTypeBGL(request.type),
        makeCanceledTypeBGL(request.type),
      ),
      filter((action: ActionBGL<Payload | Result | undefined>) => compareAsyncCorrelation(request, action)),
      mergeMap((action: ActionBGL<Payload | Result | undefined>) => isAFinishType(action.type) ? [action, null] : [action]),
      takeWhile((action) => !!action)
    );
  }

  createRawStore<State>(config: RawStoreConfigBGL<State>) {
    return new RawStoreBGL<State>(config, this.store);
  }

  createFeatureStore<State, Schema extends SchemaBGL>(
    actionsConfigs: { [Key in keyof Schema]: ActionConfigBGL<Schema[Key][0], Schema[Key][1] extends undefined ? void : Schema[Key][1]> },
    storeConfig: RawStoreConfigBGL<State>,
  ): RawStoreBGL<State> & {
    actions: {
        [Key in keyof Schema]: (Schema[Key][1] extends undefined ? void : Schema[Key][1]) extends void
            ? ActionFactoryBGL<Schema[Key][0]>
            : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>;
    }
  } {
    const store = this.createRawStore<State>(storeConfig);
    const actions = this.createActionFactories<Schema>(actionsConfigs);
    return { ...store, actions } as RawStoreBGL<State> & {
      actions: {
          [Key in keyof Schema]: (Schema[Key][1] extends undefined ? void : Schema[Key][1]) extends void
              ? ActionFactoryBGL<Schema[Key][0]>
              : AsyncActionFactoryBGL<Schema[Key][0], Schema[Key][1]>;
      }
    };
  }
}

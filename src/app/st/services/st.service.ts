import { Injectable } from '@angular/core';
import { Store, ReducerManager, select, createSelector } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { AsyncReqResConfigST } from '../interfaces/async-req-res-config-st';
import { ActionCorrelationST } from '../interfaces/action-correlation-st';
import { ActionCorrelationFactoryST } from '../classes/action-correlation-factory-st';
import { ActionFactoryST } from '../classes/action-factory-st';
import { AsyncReqResCorrelationController } from '../classes/async-req-res-correlation-controller-st';
import { ActionST } from '../interfaces/action-st';
import { allCorrelatedST } from '../operators/all-correlated-st';
import { RawStoreST, ActionPayloadResult, RawStoreConfigST } from '../classes/raw-store-st';

@Injectable()
export class STService {

  private asyncReqResMap: {
    [type: string]: (payload: any) => Observable<any>,
  } = {};

  constructor(
    public reducerManager: ReducerManager,
    public store: Store<any>,
    public actions$: Actions,
  ) { }

  registerAsyncReqRes(...configs: AsyncReqResConfigST<any, any>[]) {
    configs.forEach(config => this.asyncReqResMap[config.type] = config.async);
  }

  getAsyncReqResMapGetter() {
    return () => this.asyncReqResMap;
  }

  lifecycle(action: ActionST<any>): Observable<ActionST<any>> {
    return this.actions$.pipe(
      allCorrelatedST(...action.header.correlations),
    );
  }

  createActionFactory<P = void, R = void>(
    type: string,
    correlationTypes: string[] = [],
    async?: (payload: P) => Observable<R>
  ) {
    const correlations = () => (async ? [AsyncReqResCorrelationController.type] : [])
      .concat(correlationTypes)
      .map(thisType => new ActionCorrelationFactoryST({ type: thisType, initial: true }));
    const factory = (payload: P) => new ActionFactoryST({
      type, payload,
      correlations: correlations(),
    });
    if (async) {
      this.registerAsyncReqRes({ type, async });
    }
    return {
      create: factory,
      dispatch: (payload: P) => this.store.dispatch(factory(payload)),
    };
  }

  createFeatureStore<S = {}>(
    selector: string,
    initialState: S,
    actions: {
      [type: string]: {
        correlationTypes?: string[],
        async?: (Payload: any) => Observable<any>
      }
    },
    reduce: (state: S, action: ActionST<any>) => S,
  ) {
    const factories = Object.entries(actions)
      .map(([type, { correlationTypes, async }]) => ({ type, factory: this.createActionFactory(type, correlationTypes, async) }))
      .reduce((agg: any, { type, factory }) => ({ ...agg, [type]: factory }), {});
    this.createRawStore<S>(selector, initialState, (state: S = initialState, action: ActionST<any>) => reduce(state, action));
    return factories;
  }

  createRawStore<S = {}>(
    selector: string,
    initialState: S,
    reducer: (state: S, action: { type: string, payload: any }) => S = (s: S = initialState) => s
  ) {
    this.reducerManager.addReducer(selector, (state: S = initialState, action: { type: string, payload: any }) => reducer(state, action));
  }

  createStore<S = {}>(
    selector: string,
    initialState: S,
    updateStateMap: Partial<{ [K in keyof S]: (state: S[K], action: { type: string, payload: any }) => S[K] }>
  ): Partial<{ [K in keyof S]: { create: (payload: any) => ActionFactoryST<any>, dispatch: (payload: any) => void } }> {
    const actionReducers = Object.keys(updateStateMap)
      .map(key => ({ key, type: `[Update ${selector} State] ${key}` }))
      .reduce((agg: any, item) => ({
        ...agg, [item.type]: {
          key: item.key,
          type: item.type,
          reduce: updateStateMap[item.key]
            ? (state: any, action: { type: string, payload: any }) => updateStateMap[item.key](state, action)
            : (s: any) => s
        }
      }), {});
    const actions = Object.keys(updateStateMap)
      .map(key => ({ key, factory: this.createActionFactory(`[Update ${selector} State] ${key}`, []) }))
      .reduce((agg: any, item) => ({ ...agg, [item.key]: item.factory }), {});
    this.createRawStore(selector, initialState, (state: S, action: { type: string, payload: any }) => {
      if (!actionReducers[action.type]) {
        return state;
      }
      const actionReducer = actionReducers[action.type];
      const newState = actionReducer.reduce(state[actionReducer.key], action);
      return newState !== state[actionReducer.key] ? { ...(state as Object), [actionReducer.key]: newState } : state;
    });
    return actions;
  }

  rawStoreFactory<S, AS extends ActionPayloadResult>(config: RawStoreConfigST<S, AS>): RawStoreST<S, AS> {
    const store = new RawStoreST<S, AS>(config, this.store);
    Object.entries(config.actions).forEach(([name, description]) => description.async
      ? this.registerAsyncReqRes({ type: description.type, async: description.async as (payload: AS[string][0]) => Observable<AS[string][1]> } )
      : undefined);
    return store;
  }

}

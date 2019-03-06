import { BaseStoreConfig } from 'src/maestro/factories/base-store-m';
import { ActionM } from 'src/maestro/interfaces/action-m';
import { timer, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { MaestroFacade } from 'src/maestro/store/maestro.facade';
import { select, Store, createSelector } from '@ngrx/store';
import { selectAllActionsMaestro } from 'src/maestro/store/maestro.store';
import { map, skip, distinctUntilKeyChanged, tap } from 'rxjs/operators';
import { ActionStateM } from 'src/maestro/interfaces/action-state-m';
import { responseType } from 'src/maestro/factories/base-types';

export interface AppState {
  ready: boolean;
  loading: boolean;
  loadingRefCount: number;
  loadingData: any;
  error: Error;
  errorRefCount: number;
}
export enum APP_ACTION_TYPE {
  INITIALIZE = '[APP ACTION TYPE] INITIALIZE',
  START_LOADING = '[APP ACTION TYPE] START_LOADING',
  STOP_LOADING = '[APP ACTION TYPE] STOP_LOADING',
  SET_ERROR = '[APP ACTION TYPE] SET_ERROR',
  CLEAR_ERROR = '[APP ACTION TYPE] CLEAR_ERROR',
}

export class DucksManager {
  store: Store<any>;
}

export class BaseStoreActionManagerConfig<
  S,
  C extends BaseStoreManager<S, {}, {}>,
  A extends { payload: A[P], result: A[R] },
  P extends keyof A = 'payload',
  R extends keyof A = 'result'
> {
  ducksManager?: DucksManager;
  name: string;
  isAsync: boolean;
  loading: boolean;
  loadingData: { content: string };
  async: (config: C, payload: A[P]) => Observable<A[R]>;
  reduce: (state: S, payload: A[P]) => S;
}

export class BaseStoreActionManager<
  S,
  C extends BaseStoreManager<S, {}, {}>,
  A extends { payload, result },
  P extends keyof A = 'payload',
  R extends keyof A = 'result'
> extends BaseStoreActionManagerConfig<S, C, A> {
  payload: A[P];
  result: A[R];
  constructor(config: BaseStoreActionManagerConfig<S, C, A>) {
    super();
    Object.assign(this, config);
  }
  factory(payload: A[P]) {
    return {
      type: this.name,
      isAsync: this.isAsync,
      loading: this.loading,
      loadingData: this.loadingData,
      payload,
    };
  }
  dispatch(payload: A[P]) {
    this.ducksManager.store.dispatch(this.factory(payload));
  }
}

export class BaseStoreManagerConfig<S, AS extends { [key: string]: { payload, result } }, N = `ANONYMOUS`> {
  ducksManager?: DucksManager;
  name: string;
  state: S;
  schema: AS;
  selectors?: ({ [K in keyof N]: Observable<S> }) & ({ [K in keyof S]: Observable<S[K]> });
  actions?: { [K in keyof AS]: BaseStoreActionManager<S, BaseStoreManager<S, AS, N>, AS[K]> };
}
export class BaseStoreManager<S, AS extends { [key: string]: { payload, result } }, N> extends BaseStoreManagerConfig<S, AS, N> {
  constructor(config: BaseStoreManagerConfig<S, AS, N>) {
    super();
    Object.assign(this, config);
    const stateSelector = (states: any) => states[this.name] as S;
    this.selectors[this.name] = this.ducksManager.store.pipe(select(stateSelector));
    Object.keys(this.state).forEach((key: string) => {
      const stateKeySelector = createSelector(stateSelector, (state: S) => state[key]);
      this.selectors[key] = this.ducksManager.store.pipe(select(stateKeySelector));
    });
    Object.keys(this.schema).forEach((key: string) => {
      this.actions[key] = new BaseStoreActionManager(this.schema[key] as any);
    });
  }
}

export interface AppDuck {
  ready: boolean;
  loading: boolean;
  loadingData: any;
  loadingRefCount: number;
  error: boolean;
  errorData: any;
  errorRefCount: number;
}

@Injectable()
export class AppDuckConfig extends BaseStoreManagerConfig<AppDuck, {}, {app}> { }

function test(config: AppDuckConfig) {

  interface StorageDuck {
    loaded: boolean;
    entries: { [key: string]: any };
  }
  const c = new BaseStoreManager<
    StorageDuck,
    {save: BaseStoreActionManager<StorageDuck, any, {payload: {entries}, result: {entries}}>},
    { storage }
  >({
    name: 'storage',
    state: { loaded: false, entries: null },
    schema: {
      save: {
        name: 'save',
        isAsync: true,
        loading: true,
        loadingData: { content: 'Saving ...' },
        async: (thisConfig: AppDuckConfig, payload: { entries: any }) => of({entries: {}}),
        reduce: (state: any, payload: any) => state,
      } as BaseStoreActionManager<any, any, any>
    },
  });

  c.actions.save.dispatch({ entries: {} });
  c.actions.save.async(c, { entries: { t: 't' } });
  c.actions.save.reduce(c.state, { entries: { t: 't' } });
}

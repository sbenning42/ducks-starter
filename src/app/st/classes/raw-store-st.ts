import { ActionCorrelationST } from '../interfaces/action-correlation-st';
import { Observable } from 'rxjs';
import { Store, select, createSelector } from '@ngrx/store';
import { ActionCorrelationFactoryST } from './action-correlation-factory-st';

export interface ActionPayloadResult {
  [key: string]: [any, any?];
}

export interface RawAction<K extends keyof AS, AS extends ActionPayloadResult> {
  type: string;
  correlations?: ActionCorrelationST[];
  payload: ActionPayload<K, AS>;
}

export interface RawActionConfig<K extends keyof AS, AS extends ActionPayloadResult> {
  type: string;
  correlations?: string[];
  sync?: (payload: ActionPayload<K, AS>) => ActionSyncResult<K, AS>;
  async?: (payload: ActionPayload<K, AS>) => ActionAsyncResult<K, AS>;
}

export type ActionPayload<K extends keyof AS, AS extends ActionPayloadResult> = AS[K][0] extends {} ? AS[K][0] : void;
export type ActionSyncResult<K extends keyof AS, AS extends ActionPayloadResult> = AS[K][1] extends {} ? AS[K][1] : void;
export type ActionAsyncResult<K extends keyof AS, AS extends ActionPayloadResult> = AS[K][1] extends {} ? Observable<AS[K][1]> : void;

export interface RawStoreConfigST<S, AS extends ActionPayloadResult> {
  selector: string;
  initialState: S;
  actions: {
    [K in keyof AS]: RawActionConfig<K, AS>;
  };
  reducers?: {
    [K in this['actions'][keyof AS]['type']]: { [PROP in keyof Partial<S>]: (state: S, action: RawAction<any, AS>) => S[PROP] };
  };
  reducers2?: {
    [K in keyof this['actions'][keyof AS]['type']]: { [PROP in keyof S]: (state: S[PROP], action: RawAction<any, AS>) => S[PROP] };
  };
  reduce?<K extends keyof AS>(state: S, action: RawAction<K, AS>): S;
}

export class RawStoreST<S, AS extends ActionPayloadResult> {

  private selector: string;
  private reducer: <K extends keyof AS>(state: S, action: RawAction<K, AS>) => S;
  selectors: { [K in keyof S]: Observable<S[K]> };
  factories: {
    [K in keyof AS]: (payload: ActionPayload<K, AS>) => RawAction<K, AS>;
  };
  dispatch: {
    [K in keyof AS]: (payload: ActionPayload<K, AS>) => void;
  };

  constructor(private config: RawStoreConfigST<S, AS>, private store: Store<any>) {
    this.doUglyInit();
  }

  private createReducer(config: RawStoreConfigST<S, AS>): <K extends keyof AS>(state: S, action: RawAction<K, AS>) => S {
    return <K extends keyof AS>(state: S = config.initialState, action: RawAction<K, AS>) => ({
      ...state,
      ...(config.reducers[action.type] ? Object.entries(config.reducers[action.type]).reduce((
        partial: Partial<S>,
        [prop, reducer]: [string, (state: S, action: RawAction<any, AS>) => S[any]]
      ) => ({ ...partial, [prop]: reducer(state, action) }), {}) : {}),
    });
  }

  private doUglyInit() {
    if (!this.config.reduce) {
      this.config.reduce = this.createReducer(this.config);
    } else {
      const initialReduce = this.config.reduce;
      this.config.reduce = <K extends keyof AS>(
        state: S = this.config.initialState,
        action: RawAction<K, AS>
      ) => initialReduce(state, action);
    }
    this.selector = this.config.selector;
    this.reducer = this.config.reduce;
    this.store.addReducer(this.selector, this.reducer);
    this.selectors = Object.keys(this.config.initialState)
      .reduce((selectors: any, key: string) => ({
        ...selectors,
        [key]: this.store.pipe(select(createSelector((state: any) => state[this.selector] as S, (state: S) => state[key])))
      }), {});
    this.factories = Object.entries(this.config.actions)
      .reduce((factories: any, [name, actionConfig]: [string, RawActionConfig<any, AS>]) => ({
        ...factories,
        [name]: (payload: any) => ({
          payload,
          type: actionConfig.type,
          correlations: actionConfig.correlations
            .map(correlation => new ActionCorrelationFactoryST({ type: correlation }))
        })
      }), {});
    this.dispatch = Object.entries(this.config.actions)
      .reduce((factories: any, [name]: [string, RawActionConfig<any, AS>]) => ({
        ...factories,
        [name]: (payload: any) => this.store.dispatch(this.factories[name](payload))
      }), {});
  }
}

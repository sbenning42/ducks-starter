import { Observable, timer, of, defer, merge, Scheduler } from 'rxjs';
import * as uuid from 'uuid/v4';
import { Store, createSelector, select, ReducerManager } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions, EffectSources, ofType, Effect } from '@ngrx/effects';
import { filter, concatMap, map, catchError, mergeMap, take, tap, defaultIfEmpty, takeUntil } from 'rxjs/operators';
import { ɵngrx_modules_effects_effects_a } from '@ngrx/effects';

export function requestOf(type: string): string {
  return `${type}$REQUEST`;
}
export function cancelOf(type: string): string {
  return `${type}$CANCEL`;
}
export function responseOf(type: string): string {
  return `${type}$RESPONSE`;
}
export function errorOf(type: string): string {
  return `${type}$ERROR`;
}

class ActionDMetaConfig<P> {
  duckTracking?: boolean;
  isAsync?: boolean;
  isLoading?: boolean;
  loadingData?: { content: string };
  correlationId?: string;
}
class ActionDMeta<P> extends ActionDMetaConfig<P> {
  constructor(config: ActionDMetaConfig<P> = new ActionDMetaConfig<P>()) {
    super();
    Object.assign(this, config);
    if (this.correlationId === undefined) {
      this.correlationId = uuid();
    }
  }
}

abstract class ActionD<P> {
  abstract type: string;
  id = uuid();
  constructor(
    public payload: P,
    public meta: ActionDMeta<P> = new ActionDMeta<P>(),
  ) { }
}
class ActionDFactory<P> {
  id = uuid();
  constructor(
    public type: string,
  ) { }
  create(payload: P, meta: ActionDMeta<P> = new ActionDMeta<P>()): ActionD<P> {
    return new class extends ActionD<P> {
      constructor(public type: string) {
        super(payload, meta);
      }
    }(this.type);
  }
}

export interface BaseSchema {
  [key: string]: { payload?: any, result?: any };
}

export interface ActionSchema<S, SE, SCH extends BaseSchema, ASCH extends { payload?: any, result?: any }> {
  duckTracking?: boolean;
  isAsync?: boolean;
  reduce?: (type: string, state: S, payload: ASCH['payload'] & ASCH['result']) => S;
  async?: (duck: Duck<S, SE, SCH>) => (payload: ASCH['payload']) => Observable<ASCH['result']>;
  [key: string]: any;
}

export interface EffectsType<A extends { type: string } = { type: string, payload: any }> {
  [key: string]: Observable<A>;
}
export interface DuckAction<S, SE, SCH extends BaseSchema, ASCH extends { payload?: any, result?: any }> {
  type: string;
  meta: ActionDMeta<ASCH['payload']>;
  effects: EffectsType;
  factory: (payload: ASCH['payload'], meta?: ActionDMeta<any>) => ActionD<ASCH['payload']>;
  dispatch: (payload: ASCH['payload'], meta?: ActionDMeta<any>) => void;
  reduce: (type: string, state: S, payload: ASCH['payload'] & ASCH['result']) => S;
  async?: (duck: Duck<S, SE, SCH>) => (payload: ASCH['payload']) => Observable<ASCH['result']>;
}

export type DuckSchema<S, SE, SCH extends BaseSchema> = { [N in keyof SCH]: ActionSchema<S, SE, SCH, SCH[N]> };
export type DuckSelectors<S, SE> = { [K in keyof SE]: Observable<S> } & { [K in keyof S]: Observable<S[K]> };
export type DuckActions<S, SE, SCH extends BaseSchema> = { [N in keyof SCH]: DuckAction<S, SE, SCH, SCH[N]> };

export abstract class BaseDuckConfig<S, SE, SCH extends BaseSchema> {
  abstract selector: string;
  abstract state: S;
  abstract schema: DuckSchema<S, SE, SCH>;
}

export abstract class BaseDuck<S, SE, SCH extends BaseSchema> implements BaseDuck<S, SE, SCH> {
  protected store: Store<any>;
  selectors: DuckSelectors<S, SE>;
  actions: DuckActions<S, SE, SCH>;
  constructor(protected config: BaseDuckConfig<S, SE, SCH>) {
    this.makeSelectors();
    this.makeActions();
  }
  private makeSelectors() {
    const config = this.config;
    const selectState = (states: any) => states[config.selector] as S;
    const observeStateKey = (key: string) => {
      const selectKey = createSelector(selectState, (state: S) => state[key]);
      return { key, select$: defer(() => this.store.pipe(select(selectKey))) };
    };
    interface NamedSelector {
      key: string;
      select$: Observable<any>;
    }
    interface NamedSelectors {
      [key: string]: NamedSelector;
    }
    const aggregate = (selectors: NamedSelectors, selector: NamedSelector) => ({ ...selectors, [selector.key]: selector.select$ });
    const initial = { [config.selector]: defer(() => this.store.pipe(select(selectState))) };
    this.selectors = Object.keys(config.state).map(observeStateKey).reduce(aggregate, initial) as DuckSelectors<S, SE>;
  }
  private makeActions() {
    const config = this.config;
    const getMeta = (action: any) => ({
      duckTracking: action.duckTracking,
      isAsync: action.isAsync,
      isLoading: action.isLoading,
      loadingData: action.loadingData,
    });
    this.actions = Object.keys(config.schema)
      .map((key: string) => ({ key, ...config.schema[key] }))
      .reduce((actions: any, action: any) => ({
        ...actions,
        [action.key]: {
          type: action.key,
          meta: getMeta(action),
          reduce: action.reduce || ((_, state: S) => state),
          async: action.async,
          factory: (payload: any, meta?: ActionDMeta<any>) => new ActionDFactory(action.key).create(payload, meta || getMeta(action)),
          dispatch: (payload: any, meta?: ActionDMeta<any>) => this.store.dispatch(
            new ActionDFactory(action.key).create(payload, meta || getMeta(action))
          ),
        }
      }), {});
  }
}
export class Duck<S, SE = { anonymous }, AS extends BaseSchema = {}> extends BaseDuck<S, SE, AS> {
  protected store: Store<any>;
  protected config: BaseDuckConfig<S, SE, AS>;
  selectors: DuckSelectors<S, SE>;
  actions: DuckActions<S, SE, AS>;
  constructor(config: BaseDuckConfig<S, SE, AS>) {
    super(config);
  }
}

export function baseActionSchemaConfig(duckTracking: boolean = false) {
  return { duckTracking, isAsync: false, isLoading: false, loadingData: null };
}

export function baseActionSchemaAsyncConfig(
  duckTracking: boolean = true,
  isLoading: boolean = true,
  loadingData: { content: string } = { content: '' }
) {
  return { duckTracking, isAsync: true, isLoading, loadingData };
}

@Injectable()
export class Ducks {
  ducks: { [selector: string]: Duck<any, any, any> } = {};
  constructor(
    public store: Store<any>,
    public actions$: Actions,
    public reducerManager: ReducerManager,
    public effectsManager: EffectSources,
  ) { }
  registerDuck<D extends Duck<any, any, any>>(duck: D) {
    duck['store'] = this.store;
    this.ducks[duck['config']['selector']] = duck;
    this.reducerManager.addReducer(
      duck['config']['selector'],
      (state: any = duck['config']['state'], action: ActionD<any>) => (Object.keys(duck.actions).some(key => action.type.startsWith(key))
        ? Object.entries(duck.actions)
          .filter(([key]) => action.type.startsWith(key))
          .map(([, thisAction]) => thisAction.reduce(action.type, state, action.payload))
          .reduce((thisState: any, stepState: any) => ({ ...thisState, ...stepState }), state)
        : state)
    );
    Object.values(duck.actions).filter((action) => action.meta.isAsync).forEach(action => {
      action.effects = action.effects ? action.effects : {};
      action.effects[`${action.type}Request$`] = defer(() => this.actions$.pipe(
        ofType(action.type),
        map((thisAction: ActionD<any>) => ({ type: requestOf(action.type), payload: thisAction.payload })),
      ));
      action.effects[`${action.type}Async$`] = defer(() => this.actions$.pipe(
        ofType(requestOf(action.type)),
        concatMap((request: ActionD<any>) => action.async(duck)(request.payload).pipe(
          take(1),
          map((result: any) => ({ type: responseOf(action.type), payload: { _payload: request.payload, ...result } })),
          catchError((error: Error) => of({ type: errorOf(action.type), payload: { _payload: request.payload, ...error } })),
          takeUntil(this.actions$.pipe(ofType(cancelOf(action.type)))),
        ))
      ));
      Effect({ dispatch: true })(action.effects, `${action.type}Async$`);
      Effect({ dispatch: true })(action.effects, `${action.type}Request$`);
    });
    this.effectsManager.addEffects(
      Object.values(duck.actions)
        .map(action => action.effects)
        .reduce((allEffects, actionEffects) => ({ ...allEffects, ...actionEffects }), {})
    );
  }
}

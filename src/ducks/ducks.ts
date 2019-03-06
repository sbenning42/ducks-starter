import { Observable, timer, of, defer } from 'rxjs';
import * as uuid from 'uuid/v4';
import { Store, createSelector, select, ReducerManager } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions, EffectSources, ofType, Effect } from '@ngrx/effects';
import { filter, concatMap, map, catchError, mergeMap, take, tap } from 'rxjs/operators';

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
  asyncId?: string;
  correlationId?: string;
}
class ActionDMeta<P> extends ActionDMetaConfig<P> {
  constructor(config: ActionDMetaConfig<P> = new ActionDMetaConfig<P>()) {
    super();
    Object.assign(this, config);
    if (this.isAsync === true) {
      this.asyncId = uuid();
    }
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
    const getType = () => this.type;
    class AnonymousActionD extends ActionD<P> {
      type = getType();
      constructor() {
        super(payload, meta);
      }
    }
    return new AnonymousActionD();
  }
}

export interface BaseSchema {
  [key: string]: { payload?: any, result?: any };
}

export class Duck<S, SE = { anonymous }, AS extends { [key: string]: { payload?, result?} } = {}> {
  protected store?: Store<any>;
  protected selector: string;
  protected state: S;
  protected schema: {
    [K in keyof AS]: {
      duckTracking?: boolean;
      isAsync?: boolean;
      isLoading?: boolean;
      loadingData?: { content: string };
      reduce?: (type: string, state: S, payload: AS[K]['payload']) => S;
      async?: (duck: Duck<S, SE, AS>) => (payload: AS[K]['payload']) => Observable<AS[K]['result']>;
    }
  };
  selectors?: {
      [K in keyof SE]: Observable<S>
    } & {
      [K in keyof S]: Observable<S[K]>
    };
  actions?: {
    [K in keyof AS]: {
      type: string;
      meta: ActionDMeta<AS[K]['payload']>;
      effects: any;
      factory: (payload: AS[K]['payload'], meta?: ActionDMeta<any>) => ActionD<AS[K]['payload']>;
      dispatch: (payload: AS[K]['payload'], meta?: ActionDMeta<any>) => void;
      reduce: (type: string, state: S, payload: AS[K]['payload']) => S;
      async?: (duck: Duck<S, SE, AS>) => (payload: AS[K]['payload']) => Observable<AS[K]['result']>;
    }
  };
  constructor(config?: Duck<S, SE, AS>|any) {
    Object.assign(this, config);
    if (config) {
      const selectState = (states: any) => states[this.selector] as S;
      this.selectors = Object.keys(this.state)
        .map((key: string) => {
          const selectKey = createSelector(selectState, (state: S) => state[key]);
          return { key, select$: defer(() => this.store.pipe(select(selectKey))) };
        })
        .reduce((selectors: any, selector: { key: string, select$: Observable<any> }) => ({
          ...selectors,
          [selector.key]: selector.select$
        }), { [this.selector]: defer(() => this.store.pipe(select(selectState))) } as any);
      const getMeta = (action: any) => ({
        duckTracking: action.duckTracking,
        isAsync: action.isAsync,
        isLoading: action.isLoading,
        loadingData: action.loadingData,
      });
      this.actions = Object.keys(this.schema)
        .map((key: string) => ({ key, ...this.schema[key] }))
        .reduce((actions: any, { key, ...action }: any) => ({
          ...actions,
          [key]: {
            type: key,
            meta: getMeta(action),
            reduce: action.reduce || ((type: string, state: S) => state),
            async: action.async,
            factory: (payload: any, meta?: ActionDMeta<any>) => new ActionDFactory(key).create(payload, meta || getMeta(action)),
            dispatch: (payload: any, meta?: ActionDMeta<any>) => this.store.dispatch(
              new ActionDFactory(key).create(payload, meta || getMeta(action))
            ),
          }
        }), {});
    }
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
    this.ducks[duck['selector']] = duck;
    this.reducerManager.addReducer(
      duck['selector'],
      (state: any = duck['state'], action: ActionD<any>) => (Object.keys(duck.actions).some(key => action.type.startsWith(key))
        ? Object.entries(duck.actions)
          .filter(([key]) => action.type.startsWith(key))
          .map(([, thisAction]) => thisAction.reduce(action.type, state, action.payload))
          .reduce((thisState: any, stepState: any) => ({ ...thisState, ...stepState }), state)
        : state)
    );
    Object.entries(duck.actions).forEach(([, action]) => {
      console.log('Handling action: ', action);
      if (action.meta.isAsync) {
        action.effects = action.effects ? action.effects : {};

        const decorEffect = Effect({ dispatch: true });

        action.effects.async$ = defer(() => this.actions$.pipe(
          tap(a => console.log('got in before request 00: ', a, a.type, action)),
          ofType(requestOf(action.type)),
          tap(a => console.log('got: ', a)),
          concatMap((request: ActionD<any>) => action.async(duck)(request.payload).pipe(
            take(1),
            map((result: any) => ({ type: responseOf(action.type), payload: { _payload: request.payload, ...result } })),
            catchError((error: Error) => of({ type: errorOf(action.type), payload: { _payload: request.payload, ...error } })),
          ))
        ));
        decorEffect(action.effects, 'async$');

        action.effects.request$ = defer(() => this.actions$.pipe(
          tap(a => console.log('got in before request: ', a, a.type, action.type)),
          ofType(action.type),
          tap(a => a.type === action.type ? console.log('got in request: ', a) : undefined),
          map((thisAction: ActionD<any>) => ({ type: requestOf(action.type), payload: thisAction.payload })),
        ));
        decorEffect(action.effects, 'request$');

        this.effectsManager.addEffects(action.effects);

        console.log('Has registered: ', action.effects, ' from: ', action.type);
      }
    });
  }
}

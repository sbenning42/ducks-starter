import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store, ReducerManager } from '@ngrx/store';
import { Dictionary, EntityState, Update } from '@ngrx/entity';
import { map } from 'rxjs/operators';
import { ActionStateM } from '../interfaces/action-state-m';
import {
  MaestroState,
  selectMaestro,
  selectActionsMaestro,
  selectAllActionsMaestro,
  selectEntitiesActionsMaestro,
  selectIdsActionsMaestro,
  selectTotalActionsMaestro,
  AddMaestroAction,
  UpdateMaestroAction,
  RemoveMaestroAction,
  ClearMaestro
} from './maestro.store';
import { BaseStore, BaseStoreConfig, baseStoreFactory } from '../factories/base-store-m';
import { Actions, EffectSources } from '@ngrx/effects';
import { ActionM } from '../interfaces/action-m';

@Injectable()
export class MaestroFacade {

  private sideEffects: { [type: string]: (payload: any, actions$: Actions, store: Store<any>) => Observable<any> } = {};
  private stores: { [selector: string]: BaseStore } = {};

  maestro$: Observable<MaestroState> = this.store.pipe(select(selectMaestro));
  actions$: Observable<EntityState<ActionStateM>> = this.store.pipe(select(selectActionsMaestro));
  allActions$: Observable<ActionStateM[]> = this.store.pipe(select(selectAllActionsMaestro));
  entitiesActions$: Observable<Dictionary<ActionStateM>> = this.store.pipe(select(selectEntitiesActionsMaestro));
  idsActions$: Observable<string[] | number[]> = this.store.pipe(select(selectIdsActionsMaestro));
  totalActions$: Observable<number> = this.store.pipe(select(selectTotalActionsMaestro));

  entityActions: (id: string) => Observable<ActionStateM> = (id: string) => this.entitiesActions$.pipe(
    map((dictionary: Dictionary<ActionStateM>) => dictionary[id]),
  )

  constructor(
    public store: Store<any>,
    public reducerManager: ReducerManager,
    public effectSource: EffectSources
  ) { }

  registerStore(store: BaseStore) {
    this.stores[store.selector] = store;
    this.reducerManager.addReducer(store.selector, store.reducer);
    store.effects.forEach(
      ({ source$ }: { source$: Observable<ActionM>, config: { dispatch?: boolean, name: string } }) => this.effectSource.addEffects(store)
    );
  }

  registerStoreConfig(config: BaseStoreConfig) {
    this.registerStore(baseStoreFactory(config, this));
  }

  hasStore(selector: string): boolean {
    return !!this.stores[selector];
  }

  getStore(selector: string): BaseStore {
    return this.stores[selector];
  }

  registerSideEffect<P = any, R = any>(
    type: string,
    observableFactory: (payload: P, actions$: Actions, store: Store<any>) => Observable<R>
  ) {
    this.sideEffects[type] = observableFactory as (payload: P, actions$: Actions, store: Store<any>) => Observable<R>;
  }

  hasSideEffect(type: string): boolean {
    return !!this.sideEffects[type];
  }

  sideEffect(type: string): <P = any, R = any>(payload: P, actions$: Actions, store: Store<any>) => Observable<R> {
    return this.sideEffects[type];
  }

  add(state: ActionStateM) {
    this.store.dispatch(new AddMaestroAction({ state }));
  }

  update(update: Update<ActionStateM>) {
    this.store.dispatch(new UpdateMaestroAction({ update }));
  }

  remove(id: string) {
    this.store.dispatch(new RemoveMaestroAction({ id }));
  }

  clear() {
    this.store.dispatch(new ClearMaestro());
  }

}

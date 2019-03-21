import { ActionsSchema } from '../interfaces/actions-schema';
import { ActionsSchemaType } from '../types/actions-schema.type';
import { ActionsManagerType } from '../types/actions-manager.type';
import { AsyncActionFactory } from './async-action-factory';
import { SyncActionFactory } from './sync-action-factory';
import { ActionType } from '../types/action.type';
import { ActionConfig } from './action-config';
import { getCorrelationType, baseType } from '../tools/async-correlation';
import { SYMBOL } from '../enums/symbol';
import { DuckInjector } from '../interfaces/duck-injector';
import { DucksManager } from './ducks-manager';
import { StoreManagerType } from '../types/store-manager.type';
import { StoreConfig } from './store-config';
import { select, createSelector } from '@ngrx/store';
import { Action } from './action';
import { of } from 'rxjs';

export class Duck<State, Schema extends ActionsSchema, Injector extends DuckInjector> {
    
    actions: ActionsManagerType<Schema>;
    store: StoreManagerType<State>;

    constructor(
        public injector: Injector,
        public actionsConfig: ActionsSchemaType<Schema>,
        public storeConfig: StoreConfig<State>
    ) {
        this.actions = Object.entries(actionsConfig)
            .reduce((actions, [name, config]) => ({
                ...actions,
                [name]: config.options.isAsync
                    ? new AsyncActionFactory(injector.ducks, config)
                    : new SyncActionFactory(injector.ducks, config),
            }), {}) as ActionsManagerType<Schema>;
        const selectRoot = (states: any) => states[storeConfig.selector] as State;
        this.store = Object.keys(storeConfig.initial).reduce((store, key) => ({
            ...store,
            [key]: injector.ducks.store.pipe(select(createSelector(selectRoot, (state: State) => state[key])))
        }), {
            _root: injector.ducks.store.pipe(select(selectRoot)),
        }) as StoreManagerType<State>;
        injector.ducks.store.addReducer(storeConfig.selector, storeConfig.reducer);
        injector.ducks.register(this);
    }

    getFactory(rawType: string) {
        const type = baseType(rawType);
        const factory = Object.values(this.actions).find(f => f.config.type === type);
        return factory;
    }
}

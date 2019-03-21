import { ActionsSchema } from '../interfaces/actions-schema';
import { ActionsSchemaType } from '../types/actions-schema.type';
import { ActionsManagerType } from '../types/actions-manager.type';
import { AsyncActionFactory } from './async-action-factory';
import { SyncActionFactory } from './sync-action-factory';
import { ActionType } from '../types/action.type';
import { getCorrelationType, baseType, hasCorrelationId, isResolvedType, isErroredType, isCanceledType } from '../tools/async-correlation';
import { SYMBOL } from '../enums/symbol';
import { DuckInjector } from '../interfaces/duck-injector';
import { StoreManagerType } from '../types/store-manager.type';
import { StoreConfig } from './store-config';
import { select, createSelector } from '@ngrx/store';
import { Action } from './action';
import { of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

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

    resolved(action: Action<any>) {
        const async = getCorrelationType(action, SYMBOL.ASYNC_CORRELATION);
        return this.injector.ducks.actions$.pipe(
            filter((thisAction: Action<any>) => hasCorrelationId(thisAction, async.id)),
            switchMap((thisAction: Action<any>) => of(isResolvedType(thisAction.type) ? thisAction : undefined))
        );
    }

    errored(action: Action<any>) {
        const async = getCorrelationType(action, SYMBOL.ASYNC_CORRELATION);
        return this.injector.ducks.actions$.pipe(
            filter((thisAction: Action<any>) => hasCorrelationId(thisAction, async.id)),
            switchMap((thisAction: Action<any>) => of(isErroredType(thisAction.type) ? thisAction : undefined))
        );
    }

    canceled(action: Action<any>) {
        const async = getCorrelationType(action, SYMBOL.ASYNC_CORRELATION);
        return this.injector.ducks.actions$.pipe(
            filter((thisAction: Action<any>) => hasCorrelationId(thisAction, async.id)),
            switchMap((thisAction: Action<any>) => of(isCanceledType(thisAction.type) ? thisAction : undefined))
        );
    }
}

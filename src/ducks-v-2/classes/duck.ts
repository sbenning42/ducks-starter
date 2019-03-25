import { ActionsSchema } from '../interfaces/actions-schema';
import { ActionsSchemaType } from '../types/actions-schema.type';
import { ActionsManagerType } from '../types/actions-manager.type';
import { AsyncActionFactory } from './async-action-factory';
import { SyncActionFactory } from './sync-action-factory';
import {
    getCorrelationType,
    baseType,
    hasCorrelationId,
    isResolvedType,
    isErroredType,
    isCanceledType,
    isRequestType,
    isCancelType
} from '../tools/async-correlation';
import { SYMBOL } from '../enums/symbol';
import { DuckInjector } from '../interfaces/duck-injector';
import { StoreManagerType } from '../types/store-manager.type';
import { StoreConfig } from './store-config';
import { select, createSelector } from '@ngrx/store';
import { Action } from './action';
import { of } from 'rxjs';
import { filter, switchMap, take, tap, delay } from 'rxjs/operators';

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
            [key]: injector.ducks.store.pipe(
                select(createSelector(selectRoot, (state: State) => state ? state[key] : undefined)),
                delay(0),
            )
        }), {
            _root: injector.ducks.store.pipe(
                select(selectRoot),
                delay(0),
            ),
        }) as StoreManagerType<State>;
        injector.ducks.store.addReducer(storeConfig.selector, storeConfig.reducer);
        injector.ducks.register(this);
    }

    dispatch(action: Action<any>) {
        this.injector.ducks.store.dispatch(action);
    }

    getFactory(rawType: string) {
        const type = baseType(rawType);
        const factory = Object.values(this.actions).find(_factory => _factory.config.type === type);
        return factory;
    }

    resolved(action: Action<any>) {
        const async = getCorrelationType(action, SYMBOL.ASYNC_CORRELATION);
        return this.injector.ducks.actions$.pipe(
            filter((thisAction: Action<any>) => hasCorrelationId(thisAction, async.id)),
            filter((thisAction: Action<any>) => !isRequestType(thisAction.type) && !isCancelType(thisAction.type)),
            take(1),
            switchMap((thisAction: Action<any>) => of(isResolvedType(thisAction.type) ? thisAction : undefined)),
            // tap((thisAction: Action<any>) => console.log('thisAction@resolved: ', thisAction)),
        );
    }

    errored(action: Action<any>) {
        const async = getCorrelationType(action, SYMBOL.ASYNC_CORRELATION);
        return this.injector.ducks.actions$.pipe(
            filter((thisAction: Action<any>) => hasCorrelationId(thisAction, async.id)),
            filter((thisAction: Action<any>) => !isRequestType(thisAction.type) && !isCancelType(thisAction.type)),
            take(1),
            switchMap((thisAction: Action<any>) => of(isErroredType(thisAction.type) ? thisAction : undefined)),
            // tap((thisAction: Action<any>) => console.log('thisAction@errored: ', thisAction)),
        );
    }

    canceled(action: Action<any>) {
        const async = getCorrelationType(action, SYMBOL.ASYNC_CORRELATION);
        return this.injector.ducks.actions$.pipe(
            filter((thisAction: Action<any>) => hasCorrelationId(thisAction, async.id)),
            filter((thisAction: Action<any>) => !isRequestType(thisAction.type) && !isCancelType(thisAction.type)),
            take(1),
            switchMap((thisAction: Action<any>) => of(isCanceledType(thisAction.type) ? thisAction : undefined)),
            // tap((thisAction: Action<any>) => console.log('thisAction@canceled: ', thisAction)),
        );
    }
}

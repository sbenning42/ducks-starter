import { BaseSchema, _ZStore, ZStoreActionsConfig } from "../types/z-tools.types";
import { Store } from "@ngrx/store";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action } from "./action.class";
import { createStore } from "../functions/create-store.function";
import {
    isZTaskRequestType,
    isZTaskCancelType,
    isZTaskResolveType,
    isZTaskErrorType,
    grabCorrelationType,
    grabCorrelationId,
    asCancelType,
    asResolveType,
    asErrorType
} from "../functions/z-tools.functions";
import { filter, map, mergeMap, take, catchError, takeUntil, startWith } from "rxjs/operators";
import { Z_SYMBOL } from "../enums/z-symbol.enum";
import { ActionFactory } from "./action-factory.class";
import { of, Observable, defer } from "rxjs";

export class ZStore<State extends {}, Schema extends BaseSchema> {
    zstore: _ZStore<State, Schema>;
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action>,
        public selector: string,
        public configs: ZStoreActionsConfig<State, Schema> & { initial: State },
    ) {
        this.zstore = createStore<State, Schema>(store, selector, configs);
        store.addReducer(selector, (state: State = configs.initial, action: Action) => {
            const config = Object.values(this.configs).find(config => action.type.includes(config.type));
            switch (true) {
                case !config:
                    return state;
                case isZTaskRequestType(action.type):
                    return config.reducers.request(state, action.payload);
                case isZTaskCancelType(action.type):
                    return config.reducers.cancel(state);
                case isZTaskResolveType(action.type):
                    return config.reducers.resolve(state, action.payload);
                case isZTaskErrorType(action.type):
                    return config.reducers.error(state, action.payload);
                default:
                    return state;
            }
        });
        Effect({ dispatch: true })(this, 'handle$');
    }

    protected handle$ = this.actions$.pipe(
        filter(action => isZTaskRequestType(action.type)
            && !!grabCorrelationType(action, Z_SYMBOL.TASK_CORREL)
            && Object.values(this.configs).some(config => action.type.includes(config.type))
        ),
        map(action => ({
            action,
            correlation: grabCorrelationType(action, Z_SYMBOL.TASK_CORREL),
            config: Object.values(this.configs)
                .find(config => action.type.includes(config.type)),
            factory: Object.values(this.zstore)
                .find(propV => !!propV.config && action.type.includes(propV.config.type)) as ActionFactory<State, any, any, boolean>,
        })),
        // tap(({ action, config, factory, correlation }) => console.log('GOT: ', action, config, factory, correlation)),
        filter(({ action, config, factory, correlation }) => !!action
            && !!config
            && !!factory
            && !!correlation
        ),
        mergeMap(({ action, config, factory, correlation }) => {
            const handler = (config.handler.async
                ? config.handler.handler
                : (payload: any) => of(config.handler.handler(payload))) as (payload: any) => Observable<any>;
            return defer(() => handler(action.payload).pipe(
                take(1),
                map(result => factory.resolve(action, result, [])),
                catchError(error => of(factory.error(action, { name: error.name, message: error.message }, []))),
                takeUntil(this.actions$.pipe(
                    filter(thisAction => isZTaskCancelType(thisAction.type)),
                    filter(thisAction => !!grabCorrelationId(thisAction, correlation.id)),
                )),
            ));
        }),
        startWith({ type: `@Z/${Z_SYMBOL.TASK}/${Z_SYMBOL.TASK_CORREL}/for/${this.selector}/start` }),
    );
    
    dispatch(action: Action) {
        this.store.dispatch(action);
    }

    finish(request: Action, CORRELATION: string = Z_SYMBOL.TASK_CORREL) {
        const baseTypeParts = request.type.split(`/${Z_SYMBOL.Z}/`);
        const baseType = baseTypeParts[0];
        const { id } = grabCorrelationType(request, CORRELATION);
        return this.actions$.pipe(
            ofType(
                asCancelType(baseType),
                asResolveType(baseType),
                asErrorType(baseType),
            ),
            filter((action: Action) => !!grabCorrelationId(action, id)),
            map((action: Action) => ({
                action,
                status: action.type.split(`/${Z_SYMBOL.TASK}/`)[1],
            })),
            take(1),
        );
    }
}

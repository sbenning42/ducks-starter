import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { ActionD } from "./action";
import { ActionConfigTypeD } from "../types/action-config-type";
import { createActionFactoryD } from "../factories/create-action-factory";
import { ActionConfigD } from "./action-config";
import { ActionConfigMapD } from "../types/action-config-map";
import { ActionConfigSchemaD } from "../interfaces/action-config-schema";
import { ActionFactoryMapD } from "../types/action-factory-map";
import { StoreConfigD } from "./store-config";
import { Duck } from "./duck";
import { AsyncActionFactoryD } from "./async-action-factory";
import { SyncActionFactoryD } from "./sync-action-factory";
import { asyncResolvedOf, asyncErroredOf, asyncCanceledOf } from "../tools/async";

export class DucksManagerD {
    ducks = {};
    private _dispatch = (action: ActionD<any>) => this.store.dispatch(action);
    constructor(
        public store: Store<any>,
        public actions$: Actions<ActionD<any>>
    ) {}

    createActionFactory<Config extends ActionConfigTypeD<any, any>>(config: ActionConfigD<Config>) {
        return createActionFactoryD<Config>((action: ActionD<any>) => this._dispatch(action), config);
    }

    createActionFactories<Config extends ActionConfigSchemaD>(configMap: ActionConfigMapD<Config>) {
        return Object.entries(configMap).reduce((factories, [name, config]) => ({
            ...factories,
            [name]: this.createActionFactory(config),
        }), {}) as ActionFactoryMapD<Config>;
    }

    registerDuck<State, Schema extends ActionConfigSchemaD, Injectors extends {} = {}>(
        duck: Duck<State, Schema, Injectors>
    ) {
        this.ducks[duck.storeConfig.type] = duck;
    }

    createDuck<State, Schema extends ActionConfigSchemaD, Injectors extends {} = {}>(
        injectors: Injectors,
        storeConfig: StoreConfigD<State>,
        actionConfigMap: ActionConfigMapD<Schema>,
    ) {
        const duck = new Duck(this, injectors, storeConfig, actionConfigMap);
        this.registerDuck(duck);
    }

    getDuckOf(action: ActionD<any>) {
        return Object.values(this.ducks)
            .find((duck: Duck<any, any>) => Object.values(duck.actionsManager)
                .some(manager => action.type.includes(manager.config.type))
            ) as Duck<any, any>;
    }

    getActionFactoryOf(action: ActionD<any>) {
        let factory: SyncActionFactoryD<any> | AsyncActionFactoryD<any>;
        Object.values(this.ducks)
            .find((duck: Duck<any, any>) => {
                factory = Object.values(duck.actionsManager)
                    .find(thisFactory => action.type.includes(thisFactory.config.type));
                return !!factory;   
            })
        return factory && factory['create'] ? (factory as SyncActionFactoryD<any>) : (factory as AsyncActionFactoryD<any>);
    }

    asyncResolvedOf(action: ActionD<any>) {
        return this.actions$.pipe(asyncResolvedOf(action));
    }

    asyncErroredOf(action: ActionD<any>) {
        return this.actions$.pipe(asyncErroredOf(action));
    }

    asyncCanceledOf(action: ActionD<any>) {
        return this.actions$.pipe(asyncCanceledOf(action));
    }
}

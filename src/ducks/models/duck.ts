import { DucksManagerD } from "./ducks-manager";
import { StoreManagerD } from "./store-manager";
import { ActionFactoryMapD } from "../types/action-factory-map";
import { ActionConfigSchemaD } from "../interfaces/action-config-schema";
import { StoreConfigD } from "./store-config";
import { ActionConfigMapD } from "../types/action-config-map";
import { ActionD } from "./action";
import { DuckInjectorD } from "../interfaces/duck-injector";
import { Actions } from "@ngrx/effects";

export class Duck<State, Schema extends ActionConfigSchemaD, Injectors extends DuckInjectorD> {
    
    store: StoreManagerD<State>;
    actions: ActionFactoryMapD<Schema>;

    actions$: Actions<ActionD<any>>;

    constructor(
        protected injectors: Injectors,
        protected storeConfig: StoreConfigD<State>,
        protected actionConfigMap: ActionConfigMapD<Schema>,
    ) {
        const { manager: ducks } = injectors;
        this.store = new StoreManagerD(storeConfig, ducks.store);
        this.actions = ducks.createActionFactories(actionConfigMap);
        ducks.store.addReducer(
            storeConfig.type,
            (state: State = storeConfig.initialState, action: ActionD<any>) => storeConfig.reducer(state, action)
        );
        ducks.registerDuck(this);
        this.actions$ = ducks.actions$;
    }

    dispatch(action: ActionD<any>) {
        this.injectors.manager.store.dispatch(action);
    }

    asyncResolvedOf(action: ActionD<any>) {
        return this.injectors.manager.asyncResolvedOf(action);
    }

    asyncErroredOf(action: ActionD<any>) {
        return this.injectors.manager.asyncErroredOf(action);
    }

    asyncCanceledOf(action: ActionD<any>) {
        return this.injectors.manager.asyncCanceledOf(action);
    }
}
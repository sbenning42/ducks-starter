import { DucksManagerD } from "./ducks-manager";
import { StoreManagerD } from "./store-manager";
import { ActionFactoryMapD } from "../types/action-factory-map";
import { ActionConfigSchemaD } from "../interfaces/action-config-schema";
import { StoreConfigD } from "./store-config";
import { ActionConfigMapD } from "../types/action-config-map";
import { ActionD } from "./action";

export class Duck<State, Schema extends ActionConfigSchemaD, Injectors extends {} = {}> {
    
    storeManager: StoreManagerD<State>;
    actionsManager: ActionFactoryMapD<Schema>;

    constructor(
        public ducks: DucksManagerD,
        public injectors: Injectors,
        public storeConfig: StoreConfigD<State>,
        public actionConfigMap: ActionConfigMapD<Schema>,
    ) {
        this.storeManager = new StoreManagerD(storeConfig, ducks.store);
        this.actionsManager = ducks.createActionFactories(actionConfigMap);
        ducks.store.addReducer(
            storeConfig.type,
            (state: State = storeConfig.initialState, action: ActionD<any>) => storeConfig.reducer(state, action)
        );
        ducks.registerDuck(this);
    }

    dispatch(action: ActionD<any>) {
        this.ducks.store.dispatch(action);
    }
}
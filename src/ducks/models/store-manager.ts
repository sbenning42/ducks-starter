import { StoreConfigD } from "./store-config";
import { Observable } from "rxjs";
import { Store, select, createSelector } from "@ngrx/store";

export class StoreManagerD<State> {
    selectors: {
        rootState: Observable<State>
    } & {
        [X in keyof State]: Observable<State[X]>;
    };
    constructor(
        public config: StoreConfigD<State>,
        store: Store<any>
    ) {
        const selectState = (states: any) => states[config.type] as State;
        const stateSelector = { rootState: store.pipe(select(selectState)) };
        this.selectors = Object.entries(config.initialState).reduce((selectors, [prop]) => ({
            ...selectors,
            [prop]: store.pipe(select(createSelector(selectState, state => state[prop])))
        }), stateSelector) as {
            rootState: Observable<State>
        } & {
            [X in keyof State]: Observable<State[X]>;
        };
    }
}
import { BaseSchema, ZStoreActionsConfig, _ZStore } from "../types/z-tools.types";
import { Store, select, createSelector } from "@ngrx/store";
import { ActionFactory } from "../classes/action-factory.class";

export function createStore<State extends {}, Schema extends BaseSchema>(
    store: Store<any>,
    selector: string,
    configs: ZStoreActionsConfig<State, Schema> & { initial: State },
): _ZStore<State, Schema> {
    const selectState = (states: any) => states[selector] as State;
    const selectors = Object.entries(configs.initial)
        .reduce((selectors, [prop]) => ({
            ...selectors,
            [prop]: store.pipe(
                select(createSelector(selectState, state => state[prop]))
            )
        }), {
            _state: store.pipe(
                select(selectState)
            )
        });
    const actions = Object.entries(configs)
        .filter(([prop]) => prop !== 'initial')
        .reduce((actions, [prop, config]) => ({
            ...actions,
            [prop]: new ActionFactory(store, config),
        }), {});
    return { ...selectors, ...actions } as _ZStore<State, Schema>;
}

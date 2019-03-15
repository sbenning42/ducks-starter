import { RawStoreConfigBGL } from "./raw-store-config-bgl";
import { Observable } from "rxjs";
import { ActionBGL } from "./action-bgl";
import { Store, select, createSelector } from "@ngrx/store";

export class RawStoreBGL<State> {
    private type: string;
    private reducer: <Payload>(state: State, action: ActionBGL<Payload>) => State;
    state$: Observable<State>;
    selectors: { [Key in keyof State]: Observable<State[Key]> };
    constructor(private config: RawStoreConfigBGL<State>, private store: Store<any>) {
        const selectState = (state: any) => state[this.type] as State;
        this.type = config.type;
        this.state$ = this.store.pipe(select(selectState));
        this.selectors = Object.keys(config.initialState).reduce((selectors, key) => ({
            ...selectors,
            [key]: this.store.pipe(select(createSelector(selectState, (state: State) => state[key])))
        }), {}) as { [Key in keyof State]: Observable<State[Key]> };
        this.reducer = config.reducer
            ? (state: State = config.initialState, action: ActionBGL<any>) => config.reducer(state, action)
            : this.createReducer();
        this.store.addReducer(this.type, this.reducer);
    }

    createReducer(): <Payload>(state: State, action: ActionBGL<Payload>) => State {
        return <Payload>(state: State = this.config.initialState, action: ActionBGL<Payload>) => {
            const update = this.config.updates.find(upd => upd.type === action.type);
            if (!update || update.updates.length === 0) {
                return state;
            }
            const updatedState = update.updates
                .map(upd => ({ [upd.prop]: upd.reducer(state, action) }))
                .reduce((newState, newPropState) => ({ ...newState, ...newPropState }), {});
            return {
                ...(state as Object),
                ...updatedState,
            } as State;
        };
    }
}
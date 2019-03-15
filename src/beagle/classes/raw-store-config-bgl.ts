import { ActionBGL } from './action-bgl';

export class RawStoreConfigBGL<State> {
    updates?: { type: string, updates: { prop: keyof State, reducer: (state: State, action: ActionBGL<any>) => State[keyof State] }[] }[];
    reducer?: (state: State, action: ActionBGL<any>) => State;
    constructor(
        public type: string,
        public initialState: State,
        updatesOrReducer:
            { type: string, updates: { prop: Partial<keyof State>, reducer: (state: State, action: ActionBGL<any>) => State[Partial<keyof State>] }[] }[]
            | ((state: State, action: ActionBGL<any>) => State) = s => s,
    ) {
        if (Array.isArray(updatesOrReducer)) {
            this.updates = updatesOrReducer;
        } else {
            this.reducer = updatesOrReducer;
        }
    }
}
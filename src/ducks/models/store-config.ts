import { ActionD } from "./action";

export class StoreConfigD<State> {
    constructor(
        public type: string,
        public initialState: State,
        public reducer: <Action extends ActionD<any>>(state: State, action: Action) => State,
    ) {}
}
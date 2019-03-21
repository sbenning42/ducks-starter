import { StoreReducerType } from "../types/store-reducer.type";

export class StoreConfig<State> {
    constructor(
        public selector: string,
        public initial: State,
        public reducer: StoreReducerType<State> = state => state
    ) {}
}

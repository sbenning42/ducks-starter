import { ActionHandler } from "./action-handler.class";
import { ActionOptions } from "./action-options.class";

export class ActionConfig<State extends {}, Payload, Result, Async extends boolean> {
    reducers: {
        request: (state: State, payload: Payload) => State;
        cancel: (state: State) => State;
        resolve: (state: State, payload: Result) => State;
        error: (state: State, payload: Error) => State;
    };
    constructor(
        public type: string,
        reducers: {
            request?: (state: State, payload: Payload) => State;
            cancel?: (state: State) => State;
            resolve?: (state: State, payload: Result) => State;
            error?: (state: State, payload: Error) => State;
        } = {},
        public handler: ActionHandler<Payload, Result, Async> = new ActionHandler(),
        public options: ActionOptions = new ActionOptions()
    ) {
        this.reducers = {
            request: reducers.request || (state => state),
            cancel: reducers.cancel || (state => state),
            resolve: reducers.resolve || (state => state),
            error: reducers.error || (state => state),
        };
    }
}

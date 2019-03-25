import { Observable } from "rxjs";

export class ActionHandler<Payload, Result, Async extends boolean = false> {
    handler: (payload: Payload) => Async extends false ? Result : Observable<Result>;
    constructor(
        public async: Async = false as Async,
        handler?: (payload: Payload) => Async extends false ? Result : Observable<Result>,
    ) {
        this.handler = handler
            ? handler
            : (() => {}) as any as (payload: Payload) => Async extends false ? Result : Observable<Result>;
    }
}

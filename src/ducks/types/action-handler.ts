import { Observable } from "rxjs";

export type ActionSyncHandlerD<Payload = undefined> = (payload: Payload) => void;
export type ActionAsyncHandlerD<Payload = undefined, Result = undefined> = (payload: Payload) => Observable<Result>;
export type ActionHandlerD<Payload = undefined, Result = undefined> = Result extends undefined
    ? ActionSyncHandlerD<Payload>
    : ActionAsyncHandlerD<Payload, Result>;

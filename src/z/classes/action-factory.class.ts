import { CorrelationUnion } from "../types//correlation-union.type";
import { Store } from "@ngrx/store";
import { ActionConfig } from "./action-config.class";
import { uuid } from "../functions/uuid.function";
import { asRequestType, asCancelType, grabCorrelationType, asResolveType, asErrorType, asRequestResolveType } from "../functions/z-tools.functions";
import { cleanCorrelations } from "../functions/clean-correlations.function";
import { Z_SYMBOL } from "../enums/z-symbol.enum";
import { Action } from "./action.class";

export class ActionFactory<State extends {}, Payload, Result, Async extends boolean> {

    protected CORRELATION: CorrelationUnion = this.config.handler.async ? this.config.options.CORRELATION : '@ignore';
    protected CORRELATION_TYPE: string = this.config.handler.async ? this.config.options.CORRELATION_TYPE : '@ignore';
    protected CORRELATION_DATA: any = this.config.handler.async ? this.config.options.CORRELATION_DATA : '@ignore';

    constructor(
        protected store: Store<any>,
        public config: ActionConfig<State, Payload, Result, Async>,
    ) {
    }
    
    request(payload: Payload, correlations: CorrelationUnion[] = []) {
        return {
            id: uuid(),
            type: this.config.handler.async ? asRequestType(this.config.type) : asRequestResolveType(this.config.type),
            payload: payload,
            correlations: cleanCorrelations(
                correlations
                    .concat(this.config.options.correlations.request)
                    .concat([
                        this.CORRELATION,
                        this.config.handler.async ? Z_SYMBOL.ASYNC_CORREL : Z_SYMBOL.SYNC_CORREL,
                        this.config.handler.async ? Z_SYMBOL.ASYNC_START_CORREL : Z_SYMBOL.SYNC_START_CORREL,
                    ])
            ),
        };
    }
    cancel(request: Action<Payload>, correlations: CorrelationUnion[] = []) {
        return {
            id: uuid(),
            type: asCancelType(this.config.type),
            payload: undefined,
            correlations: cleanCorrelations(
                correlations
                    .concat(this.config.options.correlations.cancel)
                    .concat([
                        grabCorrelationType(request, this.CORRELATION_TYPE),
                        grabCorrelationType(request, this.config.handler.async ? Z_SYMBOL.ASYNC_CORREL : Z_SYMBOL.SYNC_CORREL),
                        this.config.handler.async ? Z_SYMBOL.ASYNC_STOP_CORREL : Z_SYMBOL.SYNC_STOP_CORREL,
                    ])
            ),
        };
    }
    resolve(request: Action<Payload>, payload: Result, correlations: CorrelationUnion[] = []) {
        return {
            id: uuid(),
            type: asResolveType(this.config.type),
            payload: payload,
            correlations: cleanCorrelations(
                correlations
                    .concat(this.config.options.correlations.resolve)
                    .concat([
                        grabCorrelationType(request, this.CORRELATION_TYPE),
                        grabCorrelationType(request, this.config.handler.async ? Z_SYMBOL.ASYNC_CORREL : Z_SYMBOL.SYNC_CORREL),
                        this.config.handler.async ? Z_SYMBOL.ASYNC_STOP_CORREL : Z_SYMBOL.SYNC_STOP_CORREL,
                    ])
            ),
        };
    }
    error(request: Action<Payload>, payload: Error, correlations: CorrelationUnion[] = []) {
        return {
            id: uuid(),
            type: asErrorType(this.config.type),
            payload: payload,
            correlations: cleanCorrelations(
                correlations
                    .concat(this.config.options.correlations.error)
                    .concat([
                        grabCorrelationType(request, this.CORRELATION_TYPE),
                        grabCorrelationType(request, this.config.handler.async ? Z_SYMBOL.ASYNC_CORREL : Z_SYMBOL.SYNC_CORREL),
                        this.config.handler.async ? Z_SYMBOL.ASYNC_STOP_CORREL : Z_SYMBOL.SYNC_STOP_CORREL,
                    ])
            ),
        };
    }

    dispatchRequest(payload: Payload, correlations: CorrelationUnion[] = []) {
        const action = this.request(payload, correlations);
        this.store.dispatch(action);
        return action;
    }
    dispatchCancel(request: Action<Payload>, correlations: CorrelationUnion[] = []) {
        const action = this.cancel(request, correlations);
        this.store.dispatch(action);
        return action;
    }
    
    /*
    dispatchResolve(request: Action<Payload>, payload: Result, correlations: CorrelationUnion[] = []) {
        const action = this.resolve(request, payload, correlations);
        this.store.dispatch(action);
        return action;
    }
    dispatchError(request: Action<Payload>, payload: Error, correlations: CorrelationUnion[] = []) {
        const action = this.error(request, payload, correlations);
        this.store.dispatch(action);
        return action;
    }
    */    
}

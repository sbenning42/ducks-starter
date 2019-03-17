import { ActionConfigTypeD } from "../types/action-config-type";
import { ActionD } from "./action";
import { ActionConfigD } from "./action-config";
import { CorrelationD } from "./correlation";
import {
    createAsyncRequestType,
    createAsyncRetryType,
    createAsyncCancelType,
    createAsyncResolvedType,
    createAsyncErroredType
} from "../tools/async";
import { CorrelationWithDataD } from "../interfaces/correlation-with-data";
import { SYMD } from "../enums/sym";

export class AsyncActionFactoryD<Config extends ActionConfigTypeD<any, any>> {
    constructor(
        private _dispatch: (action: ActionD<any>) => void,
        public config: ActionConfigD<Config>,
    ) {}
    private create<Payload>(type: string, payload: Payload, correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return new ActionD(type, payload, correlations.concat(this.config.correlations));
    }
    
    createAsyncRequest(payload: Config['0'], correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return this.create(createAsyncRequestType(this.config.type), payload, correlations.concat(SYMD.ASYNC_CORRELATION));
    }
    
    createAsyncRetry(payload: Config['0'], correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return this.create(createAsyncRetryType(this.config.type), payload, correlations);
    }
    
    createAsyncCancel(correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return this.create<undefined>(createAsyncCancelType(this.config.type), undefined, correlations);
    }
    
    createAsyncResolved(payload: Config['1'], correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return this.create(createAsyncResolvedType(this.config.type), payload, correlations);
    }
    
    createAsyncErrored(payload: { error: Error }, correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return this.create(createAsyncErroredType(this.config.type), payload, correlations);
    }
    
    createAsyncCanceled(correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return this.create<undefined>(createAsyncErroredType(this.config.type), undefined, correlations);
    }

    dispatchAsyncRequest(payload: Config['0'], correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        const action = this.createAsyncRequest(payload, correlations);
        this._dispatch(action);
        return action;
    }

    dispatchAsyncRetry(payload: Config['0'], correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        const action = this.createAsyncRetry(payload, correlations);
        this._dispatch(action);
        return action;
    }

    dispatchAsyncCancel(correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        const action = this.createAsyncCancel(correlations);
        this._dispatch(action);
        return action;
    }

}
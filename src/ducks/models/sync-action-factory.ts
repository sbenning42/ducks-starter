import { ActionConfigTypeD } from "../types/action-config-type";
import { ActionD } from "./action";
import { ActionConfigD } from "./action-config";
import { CorrelationD } from "./correlation";
import { CorrelationWithDataD } from "../interfaces/correlation-with-data";

export class SyncActionFactoryD<Config extends ActionConfigTypeD<any, undefined>> {
    constructor(
        private _dispatch: (action: ActionD<any>) => void,
        public config: ActionConfigD<Config>,
    ) {}
    private _create<Payload>(payload: Payload, correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return new ActionD(this.config.type, payload, correlations.concat(this.config.correlations));
    }
    create(payload: Config['0'], correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        return this._create(payload, correlations);
    }
    dispatch(payload: Config['0'], correlations: (string | CorrelationD | CorrelationWithDataD)[] = []) {
        const action = this.create(payload, correlations);
        this._dispatch(action);
        return action;
    }
}

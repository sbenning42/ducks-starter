import { ActionType } from "../types/action.type";
import { ActionConfig } from "./action-config";
import { Action } from "./action";
import { CorrelationType } from "../types/correlation.type";
import { Correlation } from "./correlation";

export class SyncActionFactory<Type extends ActionType<any, undefined>> {
    constructor(
        public config: ActionConfig<Type>,
    ) {}

    create(payload: Type['0'], correlations: CorrelationType[] = []) {
        const _correlations = this.config.options.correlations
            .concat(correlations)
            .map(correlation => {
                if (typeof(correlation) === 'string') {
                    return new Correlation(correlation);
                } else if ((correlation as Correlation).id === undefined) {
                    return new Correlation(correlation.type, correlation.data);
                } else {
                    return correlation;
                }
            }) as Correlation[];
        return new Action<Type['0']>(this.config.type, payload, _correlations);
    }

}

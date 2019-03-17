import { ActionConfigTypeD } from '../types/action-config-type';
import { ActionHandlerD } from '../types/action-handler';
import { CorrelationWithDataD } from '../interfaces/correlation-with-data';

export class ActionConfigD<Config extends ActionConfigTypeD<any, any>> {
    correlations: CorrelationWithDataD[];
    constructor(
        public type: string,
        public async: boolean = false,
        correlations: (string | CorrelationWithDataD)[] = [],
        public handler?: ActionHandlerD<Config['0'], Config['1']>,
    ) {
        this.correlations = correlations.map(correlation => typeof(correlation) === 'string' ? { type: correlation } : correlation);
    }
}
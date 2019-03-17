import * as uuid from 'uuid/v4';
import { CorrelationD } from "./correlation";
import { CorrelationWithDataD } from "../interfaces/correlation-with-data";

function sameShapeness(correlation: string | CorrelationD) {
    return typeof(correlation) === 'string'
        ? new CorrelationD(correlation)
        : (correlation.id !== undefined ? correlation : { ...correlation, id: uuid() });
}

export class ActionD<Payload = any> {
    correlations: CorrelationD[];
    constructor(
        public type: string,
        public payload: Payload = {} as any,
        correlations: (CorrelationD | CorrelationWithDataD | string)[] = [],
    ) {
        this.correlations = correlations.map(sameShapeness);
    }
}
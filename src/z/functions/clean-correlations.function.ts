import { uuid } from "./uuid.function";
import { CorrelationUnion } from "../types/correlation-union.type";
import { Correlation } from "../classes/correlation.class";

export function cleanCorrelations(correlations: CorrelationUnion[]): Correlation[] {
    return (correlations as (string | Correlation)[])
        .filter(correlation => !!correlation)
        .map(correlation => typeof(correlation) === 'string'
            ? {
                id: uuid(),
                type: correlation
            }
            : {
                id: correlation.id !== undefined ? correlation.id : uuid(),
                type: correlation.type,
                data: correlation.data
            }
        );
}

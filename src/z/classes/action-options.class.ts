import { CorrelationUnion } from "../types/correlation-union.type";
import { Z_SYMBOL } from "../enums/z-symbol.enum";

export class ActionOptions {
    correlations: {
        request: CorrelationUnion[],
        cancel: CorrelationUnion[],
        resolve: CorrelationUnion[],
        error: CorrelationUnion[],
    };

    CORRELATION_TYPE: string;
    CORRELATION_DATA: any;

    constructor(
        _correlations: {
            request?: CorrelationUnion[],
            cancel?: CorrelationUnion[],
            resolve?: CorrelationUnion[],
            error?: CorrelationUnion[],
        } = {},
        public CORRELATION: CorrelationUnion = Z_SYMBOL.TASK_CORREL,
    ) {
        this.correlations = {
            request: _correlations.request || [],
            cancel: _correlations.cancel || [],
            resolve: _correlations.resolve || [],
            error: _correlations.error || [],
        };
        const { CORRELATION_TYPE, CORRELATION_DATA } = typeof(this.CORRELATION) === 'string'
            ? { CORRELATION_TYPE: this.CORRELATION, CORRELATION_DATA: undefined }
            : { CORRELATION_TYPE: this.CORRELATION.type, CORRELATION_DATA: this.CORRELATION.data };
        this.CORRELATION_TYPE = CORRELATION_TYPE;
        this.CORRELATION_DATA = CORRELATION_DATA;
    }
}

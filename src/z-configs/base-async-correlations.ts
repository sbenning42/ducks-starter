import { APP } from "./app-z-config";
import { CorrelationUnion } from "src/z/types";

export function baseAsyncCorrelations(
    loadMessage: string = '',
    errorMessage: string = 'Default Error',
    correlations: {
        request?: CorrelationUnion[];
        cancel?: CorrelationUnion[];
        resolve?: CorrelationUnion[];
        error?: CorrelationUnion[];
    } = {}
) {
    correlations = {
        request: correlations.request || [],
        cancel: correlations.cancel || [],
        resolve: correlations.resolve || [],
        error: correlations.error || [],
    };
    return {
        request: [
            { type: APP.LOAD_START_CORREL, data: { message: loadMessage } },
            ...correlations.request,
        ],
        cancel: [
            APP.LOAD_STOP_CORREL,
            ...correlations.cancel,
        ],
        resolve: [
            APP.LOAD_STOP_CORREL,
            ...correlations.resolve,
        ],
        error: [
            APP.LOAD_STOP_CORREL,
            { type: APP.ERROR_START_CORREL, data: { message: errorMessage } },
            ...correlations.error,
        ],
    };
}

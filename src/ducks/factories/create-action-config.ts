import { CorrelationWithDataD } from "../interfaces/correlation-with-data";
import { CorrelationD } from "../models/correlation";
import { ActionHandlerD } from "../types/action-handler";
import { ActionConfigD } from "../models/action-config";
import { ActionConfigTypeD } from "../types/action-config-type";

export function createActionConfigD<Payload, Result>(
    options: {
        type: string,
        correlations?: (string | CorrelationWithDataD | CorrelationD)[],
        handler?: ActionHandlerD<Payload, Result>,
        async?: boolean
    }
) {
    const { type, async, correlations, handler } = {
        async: false,
        correlations: [],
        ...options
    };
    return new ActionConfigD<ActionConfigTypeD<Payload, Result>>(type, async, correlations, handler);
}
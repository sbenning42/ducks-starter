import { ActionType } from '../types/action.type';
import { ActionHandlerType } from '../types/action-handler.type';
import { CorrelationType } from '../types/correlation.type';

export interface ActionOptions<Type extends ActionType<any, any>> {
    isAsync?: boolean;
    handler?: ActionHandlerType<Type>;
    correlations?: CorrelationType[];
}

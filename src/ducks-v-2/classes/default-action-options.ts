import { ActionOptions } from '../interfaces/action-options';
import { ActionType } from '../types/action.type';

export class DefaultActionOptions implements ActionOptions<ActionType<undefined, undefined>> {
    isAsync: false;
    handler: () => {};
    correlations: [];
}

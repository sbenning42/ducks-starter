import { ActionType } from '../types/action.type';
import { ActionOptions } from '../interfaces/action-options';
import { DefaultActionOptions } from './default-action-options';

export class ActionConfig<Type extends ActionType<any, any>> {
    constructor(
        public type: string,
        public options: ActionOptions<Type> = {}
    ) {
        this.options = {
            ...new DefaultActionOptions(),
            ...this.options,
        } as ActionOptions<Type>;
    }
}

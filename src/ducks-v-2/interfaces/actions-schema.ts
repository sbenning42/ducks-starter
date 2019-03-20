import { ActionType } from '../types/action.type';

export interface ActionsSchema {
    [x: string]: ActionType<any, any>;
}

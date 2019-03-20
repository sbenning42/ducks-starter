import { ActionType } from './action.type';
import { SyncActionHandlerType } from './sync-action-handler.type';
import { AsyncActionHandlerType } from './async-action-handler.type';

export type ActionHandlerType<Type extends ActionType<any, any>> = Type['1'] extends undefined
    ? SyncActionHandlerType<Type>
    : AsyncActionHandlerType<Type>;

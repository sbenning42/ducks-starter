import { ActionType } from './action.type';

export type SyncActionHandlerType<Type extends ActionType<any, any>> = Type['0'] extends undefined
    ? () => void
    : (payload: Type['0']) => void;

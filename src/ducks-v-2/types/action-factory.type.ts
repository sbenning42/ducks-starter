import { ActionType } from "./action.type";
import { SyncActionFactory } from "../classes/sync-action-factory";
import { AsyncActionFactory } from "../classes/async-action-factory";

export type ActionFactoryType<Type extends ActionType<any, any>> = Type['1'] extends undefined
    ? SyncActionFactory<Type>
    : AsyncActionFactory<Type>;

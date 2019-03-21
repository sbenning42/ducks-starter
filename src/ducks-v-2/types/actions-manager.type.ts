import { ActionsSchema } from "../interfaces/actions-schema";
import { ActionFactoryType } from "./action-factory.type";
import { ActionType } from "./action.type";

export type ActionsManagerType<Schema extends ActionsSchema> = {
    [Key in keyof Schema]: ActionFactoryType<ActionType<Schema[Key]['0'], Schema[Key]['1']>>;
};

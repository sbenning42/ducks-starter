import { ActionsSchema } from "../interfaces/actions-schema";
import { ActionType } from "./action.type";
import { ActionConfig } from "../classes/action-config";

export type ActionsSchemaType<Schema extends ActionsSchema> = {
    [Key in keyof Schema]: ActionConfig<ActionType<Schema[Key]['0'], Schema[Key]['1']>>;
};

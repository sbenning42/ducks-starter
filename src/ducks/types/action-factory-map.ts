import { ActionConfigSchemaD } from "../interfaces/action-config-schema";
import { SyncActionFactoryD } from "../models/sync-action-factory";
import { AsyncActionFactoryD } from "../models/async-action-factory";

export type ActionFactoryMapD<Schema extends ActionConfigSchemaD> = {
    [X in keyof Schema]: Schema[X]['1'] extends undefined ? SyncActionFactoryD<Schema[X]> : AsyncActionFactoryD<Schema[X]>;
};

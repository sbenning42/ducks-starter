import { ActionConfigSchemaD } from "../interfaces/action-config-schema";
import { ActionConfigD } from "../models/action-config";

export type ActionConfigMapD<Schema extends ActionConfigSchemaD> = {
    [X in keyof Schema]: ActionConfigD<[Schema[X]['0'], Schema[X]['1']]>;
};

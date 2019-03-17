import { ActionConfigTypeD } from "../types/action-config-type";

export interface ActionConfigSchemaD {
    [x: string]: ActionConfigTypeD<any, any>;
}
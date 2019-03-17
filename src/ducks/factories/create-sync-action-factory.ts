import { ActionConfigD } from "../models/action-config";
import { ActionConfigTypeD } from "../types/action-config-type";
import { SyncActionFactoryD } from "../models/sync-action-factory";
import { ActionD } from "../models/action";

export function createSyncActionFactoryD<Config extends ActionConfigTypeD<any, undefined>>(
    _dispatch: (action: ActionD<any>) => void,
    config: ActionConfigD<Config>
) {
    return new SyncActionFactoryD<Config>(_dispatch, config);
}

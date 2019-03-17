import { ActionConfigD } from "../models/action-config";
import { ActionConfigTypeD } from "../types/action-config-type";
import { SyncActionFactoryD } from "../models/sync-action-factory";
import { ActionD } from "../models/action";
import { AsyncActionFactoryD } from "../models/async-action-factory";

export function createActionFactoryD<Config extends ActionConfigTypeD<any, any>>(
    _dispatch: (action: ActionD<any>) => void,
    config: ActionConfigD<Config>
): ReturnType<typeof config.handler> extends void
    ? SyncActionFactoryD<Config>
    : AsyncActionFactoryD<Config>
{
    type ActionFactoryD = ReturnType<typeof config.handler> extends void
        ? SyncActionFactoryD<Config>
        : AsyncActionFactoryD<Config>;
    return (
        config.async
            ? new AsyncActionFactoryD<Config>(_dispatch, config)
            : new SyncActionFactoryD<Config>(_dispatch, config)
    ) as ActionFactoryD;
}

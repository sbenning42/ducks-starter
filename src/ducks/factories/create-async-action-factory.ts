import { ActionConfigD } from "../models/action-config";
import { ActionConfigTypeD } from "../types/action-config-type";
import { ActionD } from "../models/action";
import { AsyncActionFactoryD } from "../models/async-action-factory";

export function createAsyncActionFactoryD<Config extends ActionConfigTypeD<any, any>>(
    _dispatch: (action: ActionD<any>) => void,
    config: ActionConfigD<Config>
) {
    return new AsyncActionFactoryD<Config>(_dispatch, config);
}

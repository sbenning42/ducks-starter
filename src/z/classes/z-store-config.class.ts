import { BaseSchema, ZStoreActionsConfig } from "../types/z-tools.types";
import { Observable } from "rxjs";
import { ActionConfig } from "./action-config.class";
import { ActionHandler } from "./action-handler.class";
import { ActionOptions } from "./action-options.class";
import { CorrelationUnion } from "../types/correlation-union.type";
import { Z_SYMBOL } from "../enums/z-symbol.enum";

export class ZStoreConfig<State extends {}, Schema extends BaseSchema> {
    config: ZStoreActionsConfig<State, Schema> & { initial: State };
    constructor(
        initial: State,
        actions: {
            [Key in keyof Schema]: {
                type: string,
                reducers?: {
                    request?: (state: State, payload: Schema[Key]['0']) => State;
                    cancel?: (state: State) => State;
                    resolve?: (state: State, payload: Schema[Key]['1']) => State;
                    error?: (state: State, payload: Error) => State;
                },
                async?: Schema[Key]['2'],
                handler?: (payload: Schema[Key]['0']) => (Schema[Key]['1'] | Observable<Schema[Key]['1']>),
                correlations?: {
                    request?: CorrelationUnion[],
                    cancel?: CorrelationUnion[],
                    resolve?: CorrelationUnion[],
                    error?: CorrelationUnion[],
                },
                CORRELATION?: CorrelationUnion,
            }
        }
    ) {
        this.config = Object.entries(actions)
            .reduce((_actions, [name, def]) => ({
                ..._actions,
                [name]: new ActionConfig(
                    def.type,
                    def.reducers || {},
                    new ActionHandler<any, any, boolean>(def.async || false, def.handler || (() => {})),
                    new ActionOptions(def.correlations || {}, def.CORRELATION || Z_SYMBOL.TASK_CORREL)
                )
            }), { initial }) as ({ initial: State } & ZStoreActionsConfig<State, Schema>);
    }
}

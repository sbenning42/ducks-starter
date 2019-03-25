import { Observable } from "rxjs";
import { BaseSchema } from "../types/z-tools.types";
import { CorrelationUnion } from "../types/correlation-union.type";
import { ZStoreConfig } from "../classes/z-store-config.class";

export function createStoreConfig<State extends {}, Schema extends BaseSchema>(
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
    return new ZStoreConfig<State, Schema>(initial, actions).config;
}

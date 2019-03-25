import { Observable } from "rxjs";
import { ActionConfig } from "../classes/action-config.class";
import { ActionFactory } from "../classes/action-factory.class";

export type BaseSchema = {
    [x: string]: [any, any, boolean];
}

export type ZStoreSelectors<State extends {}> = {
    [Key in keyof State]: Observable<State[Key]>;
} & { _state: Observable<State> };

export type ZStoreActionsConfig<State extends {}, Schema extends BaseSchema> = {
    [Key in keyof Schema]: ActionConfig<State, Schema[Key]['0'], Schema[Key]['1'], Schema[Key]['2']>;
};
export type ZStoreActions<State extends {}, Schema extends BaseSchema> = {
    [Key in keyof Schema]: ActionFactory<State, Schema[Key]['0'], Schema[Key]['1'], Schema[Key]['2']>;
};

export type _ZStore<State extends {}, Schema extends BaseSchema> = ZStoreSelectors<State> & ZStoreActions<State, Schema>;

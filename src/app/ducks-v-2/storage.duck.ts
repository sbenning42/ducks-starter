import { DuckInjector } from "../../ducks-v-2/interfaces/duck-injector";
import { ActionsSchema } from "../../ducks-v-2/interfaces/actions-schema";
import { ActionType } from "../../ducks-v-2/types/action.type";
import { StorageService } from "../services/storage/storage.service";
import { Injectable } from "@angular/core";
import { Duck } from "../../ducks-v-2/classes/duck";
import { StoreConfig } from "../../ducks-v-2/classes/store-config";
import { ActionConfig } from "../../ducks-v-2/classes/action-config";
import { Action } from "../../ducks-v-2/classes/action";
import { DucksService } from "../../ducks-v-2/ducks.service";
import { resolvedType } from "../../ducks-v-2/tools/async-correlation";

/**
 * Define interfaces you may use in actions.
 */
export interface StorageEntries {
    [x: string]: any;
}

/**
 * Define the state key in store
 */
const storageSelector = 'storage';

/**
 * Define the state interface
 */
export interface StorageState {
    loaded: boolean;
    entries: StorageEntries;
}

/**
 * Define the initial value for the state interface
 */
const initialStorage: StorageState = {
    loaded: false,
    entries: null,
};

/**
 * Define the types for actions
 */
export enum STORAGE {
    GET = '@storage/get',
    SAVE = '@storage/save',
    REMOVE = '@storage/remove',
    CLEAR = '@storage/clear',
}

/**
 * Define the payload type and optional async result type
 */
export interface StorageSchema extends ActionsSchema {
    get: ActionType<undefined, StorageEntries>;
    save: ActionType<StorageEntries, StorageEntries>;
    remove: ActionType<string[], string[]>;
    clear: ActionType<undefined, {}>;
}

/**
 * Helper type that agregate all action's payload types
 */
export type StoragePayloads = undefined | string[] | StorageEntries | {};

/**
 * The injector for the duck (inject services here)
 */
export interface StorageInjector extends DuckInjector {
    storage: StorageService;
}

/**
 * The reducer function
 */
export function storageReducer(state: StorageState = initialStorage, { type, payload }: Action<StoragePayloads>): StorageState {
    const removePredicate = ([key]: [string, any]) => !(payload as string[]).includes(key);
    const agregate = (entries: StorageEntries, [key, value]: [string, any]) => ({ ...entries, [key]: value });
    switch (type) {
        case resolvedType(STORAGE.GET):
            return { ...state, loaded: true, entries: payload };
        case resolvedType(STORAGE.SAVE):
            return { ...state, entries: { ...state.entries, ...payload } };
        case resolvedType(STORAGE.REMOVE):
            return { ...state, entries: Object.entries(state.entries).filter(removePredicate).reduce(agregate, {}) };
        case resolvedType(STORAGE.CLEAR):
            return { ...state, entries: {} };
        default:
            return state;
    }
}

/**
 * The duck definition
 */
@Injectable()
export class StorageDuck extends Duck<StorageState, StorageSchema, StorageInjector> {
    constructor(
        public ducks: DucksService,
        public storage: StorageService
    ) {
        super(
            { ducks, storage },
            { 
                get: new ActionConfig(STORAGE.GET, {
                    isAsync: true,
                    handler: () => this.injector.storage.get(),
                }),
                save: new ActionConfig(STORAGE.SAVE, {
                    isAsync: true,
                    handler: (payload: StorageEntries) => this.injector.storage.save(payload),
                }),
                remove: new ActionConfig(STORAGE.REMOVE, {
                    isAsync: true,
                    handler: (payload: string[]) => this.injector.storage.remove(payload),
                }),
                clear: new ActionConfig(STORAGE.CLEAR, {
                    isAsync: true,
                    handler: () => this.injector.storage.clear(),
                }),
             },
            new StoreConfig(storageSelector, initialStorage, storageReducer),
        );
    }
}

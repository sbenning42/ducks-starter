import { Injectable } from "@angular/core";
import { Duck } from "src/ducks/models/duck";
import { DucksService } from "src/ducks/ducks.service";
import { StorageService } from "../services/storage/storage.service";
import { ActionConfigSchemaD } from "src/ducks/interfaces/action-config-schema";
import { ActionConfigTypeD } from "src/ducks/types/action-config-type";
import { StoreConfigD } from "src/ducks/models/store-config";
import { ActionConfigD } from "src/ducks/models/action-config";
import { createAsyncResolvedType } from "src/ducks/tools/async";
import { createActionConfigD } from "src/ducks/factories/create-action-config";
import { DuckInjectorD } from "src/ducks/interfaces/duck-injector";

export const storageType = 'storage2';

export interface StorageEntries {
    [x: string]: any;
}
export interface StorageState {
    loaded: boolean;
    entries: StorageEntries;
}
export const initialStorageState: StorageState = {
    loaded: false,
    entries: null,
};
export interface StorageInjector extends DuckInjectorD {
    storage: StorageService;
}
export enum STORAGE_TYPE {
    GET = '@storage/get',
    SAVE = '@storage/save',
    REMOVE = '@storage/remove',
    CLEAR = '@storage/clear',
}
export interface StorageSchema extends ActionConfigSchemaD {
    get: ActionConfigTypeD<undefined, StorageEntries>;
    save: ActionConfigTypeD<StorageEntries, StorageEntries>;
    remove: ActionConfigTypeD<string[], string[]>;
    clear: ActionConfigTypeD<undefined, {}>;
}

@Injectable()
export class StorageDuck extends Duck<StorageState, StorageSchema, StorageInjector> {
    constructor(
        ducks: DucksService,
        storage: StorageService
    ) {
        super({ manager: ducks.manager, storage },
            new StoreConfigD(storageType, initialStorageState, (state, action) => {
                switch (action.type) {
                    case createAsyncResolvedType(STORAGE_TYPE.GET):
                        return { ...state, loaded: true, entries: action.payload };
                    case createAsyncResolvedType(STORAGE_TYPE.SAVE):
                        return { ...state, entries: { ...state.entries, ...action.payload } };
                    case createAsyncResolvedType(STORAGE_TYPE.CLEAR):
                        return { ...state, entries: {} };
                    case createAsyncResolvedType(STORAGE_TYPE.REMOVE):
                        return {
                            ...state,
                            entries: Object.entries(state.entries)
                                .filter(([key]) => !action.payload.includes(key))
                                .reduce((entries, [key, value]) => ({ ...entries, [key]: value }), {}),
                        };
                    default:
                        return state;
                }
            }),
            {
                get: createActionConfigD({
                    type: STORAGE_TYPE.GET,
                    async: true,
                    handler: () => this.injectors.storage.get()
                }),
                save: createActionConfigD({
                    type: STORAGE_TYPE.SAVE,
                    async: true,
                    handler: payload => this.injectors.storage.save(payload)
                }),
                remove: createActionConfigD({
                    type: STORAGE_TYPE.REMOVE,
                    async: true,
                    handler: payload => this.injectors.storage.remove(payload)
                }),
                clear: createActionConfigD({
                    type: STORAGE_TYPE.CLEAR,
                    async: true,
                    handler: () => this.injectors.storage.clear()
                }),
            }
        );
    }
}
// new ActionConfigD(STORAGE_TYPE.REMOVE, true, [], payload => this.injectors.storage.remove(payload))

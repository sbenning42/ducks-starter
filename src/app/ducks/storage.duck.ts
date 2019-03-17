import { Injectable } from "@angular/core";
import { Duck } from "src/ducks/models/duck";
import { DucksService } from "src/ducks/ducks.service";
import { StorageService } from "../services/storage/storage.service";
import { ActionConfigSchemaD } from "src/ducks/interfaces/action-config-schema";
import { ActionConfigTypeD } from "src/ducks/types/action-config-type";
import { StoreConfigD } from "src/ducks/models/store-config";
import { ActionConfigD } from "src/ducks/models/action-config";
import { createAsyncResolvedType } from "src/ducks/tools/async";

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
export interface StorageInjector {
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
        super(
            ducks.manager,
            { storage },
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
                get: new ActionConfigD(STORAGE_TYPE.GET, true, [], () => this.injectors.storage.get()),
                save: new ActionConfigD(STORAGE_TYPE.SAVE, true, [], payload => this.injectors.storage.save(payload)),
                remove: new ActionConfigD(STORAGE_TYPE.REMOVE, true, [], payload => this.injectors.storage.remove(payload)),
                clear: new ActionConfigD(STORAGE_TYPE.CLEAR, true, [], () => this.injectors.storage.clear()),
            }
        );
    }
}

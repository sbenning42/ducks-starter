import { Injectable } from "@angular/core";
import { StorageService } from "../services/storage/storage.service";
import { BeagleService } from "../../beagle/beagle.service";
import { RawStoreConfigBGL } from "../../beagle/classes/raw-store-config-bgl";
import { ActionBGL } from "../../beagle/classes/action-bgl";
import { SchemaBGL } from "../../beagle/classes/beagle";
import { ActionConfigBGL } from "../../beagle/classes/action-config-bgl";
import { BoneBGL } from '../../beagle/classes/bone-bgl';
import { makeResolvedTypeBGL } from "../../beagle/classes/async-actions-factory-bgl";

export interface StorageState {
    loaded: boolean;
    entries: any;
}
export interface StorageSchema extends SchemaBGL {
    get: [void, Object],
    save: [Object, Object],
    remove: [string[], string[]],
    clear: [void, Object],
}
export enum StorageActionType {
    get = '[Storage Action Type] Get',
    save = '[Storage Action Type] Save',
    remove = '[Storage Action Type] Remove',
    clear = '[Storage Action Type] Clear',
}
export interface StorageInjectors {
    storage: StorageService;
}

const predicate = (action: ActionBGL<any>) => ([key]: [string, any]) => !(action.payload as string[]).includes(key);
const agregate = (entries, [key, value]) => ({ ...entries, [key]: value });

@Injectable()
export class StorageBone extends BoneBGL<StorageState, StorageSchema, StorageInjectors> {
    bone = this.beagle.createFeatureStore<StorageState, StorageSchema>(
        {
            get: new ActionConfigBGL(StorageActionType.get, ['async', 'loadasync'], () => this.injectors.storage.get()),
            save: new ActionConfigBGL(StorageActionType.save, ['async'], payload => this.injectors.storage.save(payload)),
            remove: new ActionConfigBGL(StorageActionType.remove, ['async'], payload => this.injectors.storage.remove(payload)),
            clear: new ActionConfigBGL(StorageActionType.clear, ['async'], () => this.injectors.storage.get()),
        },
        new RawStoreConfigBGL(
            'storage', { loaded: false, entries: null },
            (state: StorageState, action: ActionBGL<any>) => {
                switch (action.type) {
                    case makeResolvedTypeBGL(StorageActionType.get):
                        return {
                            ...state,
                            loaded: true,
                            entries: action.payload
                        };
                    case makeResolvedTypeBGL(StorageActionType.clear):
                        return {
                            ...state,
                            entries: {}
                        };
                    case makeResolvedTypeBGL(StorageActionType.save):
                        return {
                            ...state,
                            entries: {
                                ...state.entries,
                                ...action.payload
                            }
                        };
                    case makeResolvedTypeBGL(StorageActionType.remove):
                        return {
                            ...state,
                            entries: Object.entries(state.entries).filter(predicate(action)).reduce(agregate)
                        };
                    default:
                        return state;
                }
            },
        ),
    );
    constructor(beagle: BeagleService, storage: StorageService) {
        super(beagle, { storage });
    }
}
import { StorageService } from "src/app/services/storage/storage.service";
import {
    BaseSchema,
    createStoreConfig,
} from "src/z";
import { baseAsyncCorrelations } from "./base-async-correlations";

export const storageSelector = 'STORAGE';

export interface Entries<Entry = any> {
    [x: string]: Entry;
}

export interface StorageState {
    loaded: boolean;
    entries: Entries;
}

export const initialStorageState: StorageState = {
    loaded: false,
    entries: null,
};

export enum STORAGE {
    GET = '@STORAGE/get',
    SAVE = '@STORAGE/save',
    REMOVE = '@STORAGE/remove',
    CLEAR = '@STORAGE/clear',
}

export interface StorageSchema extends BaseSchema {
    get: [undefined, Entries, true];
    save: [Entries, Entries, true];
    remove: [string[], string[], true];
    clear: [undefined, {}, true];
}

export function storageConfigFactory(
    storage: StorageService,
) {
    return createStoreConfig<StorageState, StorageSchema>(
        initialStorageState,
        {

            // Load local storage
            get: {
                type: STORAGE.GET,
                async: true,
                handler: () => storage.get(),
                reducers: {
                    resolve: (state, payload) => ({
                        ...state,
                        loaded: true,
                        entries: payload,
                    }),
                },
                correlations: baseAsyncCorrelations('Get Storage ...', 'Cannot Get Storage ...'),
            },

            // Save entries to local storage
            save: {
                type: STORAGE.SAVE,
                async: true,
                handler: payload => storage.save(payload),
                reducers: {
                    resolve: (state, payload) => ({ ...state, entries: { ...state.entries, ...payload } }),
                },
                correlations: baseAsyncCorrelations('Save Storage ...', 'Cannot Save Storage ...'),
            },

            // Remove entries from local storage
            remove: {
                type: STORAGE.REMOVE,
                async: true,
                handler: payload => storage.remove(payload),
                reducers: {
                    resolve: (state, payload) => ({
                        ...state,
                        entries: Object.keys(state.entries)
                            .filter(key => !payload.includes(key))
                            .reduce((entries, key) => ({ ...entries, [key]: state[key] }), {}),
                    }),
                },
                correlations: baseAsyncCorrelations('Remove Storage ...', 'Cannot Remove Storage ...'),
            },

            // Clear local storage
            clear: {
                type: STORAGE.CLEAR,
                async: true,
                handler: () => storage.clear(),
                reducers: {
                    resolve: (state, payload) => ({ ...state, entries: payload}),
                },
                correlations: baseAsyncCorrelations('Clear Storage ...', 'Cannot Clear Storage ...'),
            },
        }
    );
}

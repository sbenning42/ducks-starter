import { BaseSchema } from "src/z/types";
import { createStoreConfig } from "src/z/functions";
import { StorageStore } from "src/z-stores/storage-z-store";
import { AuthStore } from "src/z-stores/auth-z-store";

export const appSelector = 'APP';

export interface AppLoadData<Data = any> {
    message: string;
    name?: string;
    data?: Data;
}

export interface AppErrorData<Data = any> {
    message: string;
    name?: string;
    stack?: string;
    data?: Data;    
}

export interface AppState {
    initialized: boolean;
    load: boolean;
    error: boolean;
    loadCount: number;
    errorCount: number;
    loadData: AppLoadData[];
    errorData: AppErrorData[];
}

export const initialAppState: AppState = {
    initialized: false,
    load: false,
    error: false,
    loadCount: 0,
    errorCount: 0,
    loadData: [],
    errorData: [],
};

export enum APP {
    GOTO = '@APP/goto',
    INITIALIZE_START = '@APP/initialize/start',
    INITIALIZE_SUCCESS = '@APP/initialize/success',
    INITIALIZE_FAILURE = '@APP/initialize/failure',
    LOAD_START = '@APP/load/start',
    LOAD_STOP = '@APP/load/stop',
    LOAD_CLEAR = '@APP/load/clear',
    ERROR_START = '@APP/error/start',
    ERROR_STOP = '@APP/error/stop',
    ERROR_CLEAR = '@APP/error/clear',
    INITIALIZE_CORREL = '@APP-initialize',
    GOTO_CORREL = '@APP-goto',
    LOAD_START_CORREL = '@APP-load-start',
    LOAD_STOP_CORREL = '@APP-load-stop',
    LOAD_CLEAR_CORREL = '@APP-load-clear',
    ERROR_START_CORREL = '@APP-error-start',
    ERROR_STOP_CORREL = '@APP-error-stop',
    ERROR_CLEAR_CORREL = '@APP-error-clear',
}

export interface AppSchema extends BaseSchema {
    goto: [string | { target: string, data?: any }, void, false],
    initializeStart: [undefined, void, false],
    initializeSuccess: [undefined, void, false],
    initializeFailure: [undefined, void, false],
    loadStart: [undefined | string | AppLoadData, void, false],
    loadStop: [undefined, void, false],
    loadClear: [undefined, void, false],
    errorStart: [string | AppErrorData, void, false],
    errorStop: [undefined, void, false],
    errorClear: [undefined, void, false],
}

export function appConfigFactory() {
    return createStoreConfig<AppState, AppSchema>(
        initialAppState,
        {
            goto: {
                type: APP.GOTO
            },
            initializeStart: {
                type: APP.INITIALIZE_START,
                correlations: {
                    request: [
                        APP.INITIALIZE_CORREL,
                        { type: APP.LOAD_START_CORREL, data: { message: 'Initialize App ...' } },
                    ]
                }
            },
            initializeSuccess: {
                type: APP.INITIALIZE_SUCCESS,
                reducers: {
                    request: (state) => ({ ...state, initialized: true }),
                },
                correlations: {
                    request: [
                        APP.LOAD_STOP_CORREL
                    ],
                }
            },
            initializeFailure: {
                type: APP.INITIALIZE_FAILURE,
                reducers: {
                    request: (state) => ({ ...state, initialized: false }),
                },
                correlations: {
                    request: [
                        APP.LOAD_STOP_CORREL
                    ],
                }
            },
            loadStart: {
                type: APP.LOAD_START,
                reducers: {
                    request: (state, payload) => ({
                        ...state,
                        load: true,
                        loadCount: state.loadCount + 1,
                        loadData: [(typeof(payload) === 'string' ? { message: payload } : payload), ...state.loadData],
                    })
                }
            },
            loadStop: {
                type: APP.LOAD_STOP,
                reducers: {
                    request: (state) => ({
                        ...state,
                        load: state.loadCount > 1,
                        loadCount: state.loadCount - 1,
                        loadData: state.loadData.slice(1),
                    })
                }
            },
            loadClear: {
                type: APP.LOAD_CLEAR,
                reducers: {
                    request: (state) => ({
                        ...state,
                        load: false,
                        loadCount: 0,
                        loadData: [],
                    })
                }
            },
            errorStart: {
                type: APP.ERROR_START,
                reducers: {
                    request: (state, payload) => ({
                        ...state,
                        error: true,
                        errorCount: state.errorCount + 1,
                        errorData: [(typeof(payload) === 'string' ? { message: payload } : payload), ...state.errorData],
                    })
                }
            },
            errorStop: {
                type: APP.ERROR_STOP,
                reducers: {
                    request: (state) => ({
                        ...state,
                        error: state.errorCount > 1,
                        errorCount: state.errorCount - 1,
                        errorData: state.errorData.slice(1),
                    })
                }
            },
            errorClear: {
                type: APP.ERROR_CLEAR,
                reducers: {
                    request: (state) => ({
                        ...state,
                        error: false,
                        errorCount: 0,
                        errorData: [],
                    })
                }
            },
        }
    );
}

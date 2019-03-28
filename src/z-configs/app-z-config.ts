import {
    BaseSchema,
    createStoreConfig,
} from "src/z";

/**
 * Property name of this state in the root store (aka: @ngrx/store)
 */
export const appSelector = 'APP';

/**
 * Interface used to describe a loader
 */
export interface AppLoadData<Data = any> {
    message: string;
    name?: string;
    data?: Data;
}

/**
 * Interface used to describe an error
 */
export interface AppErrorData<Data = any> {
    message: string;
    name?: string;
    stack?: string;
    data?: Data;    
}

/**
 * The app state
 */
export interface AppState {
    initialized: boolean;
    load: boolean;
    error: boolean;
    loadCount: number;
    errorCount: number;
    loadData: AppLoadData[];
    errorData: AppErrorData[];
}

/**
 * The initial value of the app state
 */
export const initialAppState: AppState = {
    initialized: false,
    load: false,
    error: false,
    loadCount: 0,
    errorCount: 0,
    loadData: [],
    errorData: [],
};

/**
 * All app's action types
 * 
 * IMPORTANT use this enum EVERYWHERE
 * NEVER use the actual string constants
 * Even thougth, you migth typescript type's it as a string,
 * Anyway, always use APP.____ to reference the ACTUAL VALUE
 */
export enum APP {
    /**
     * Use router to navigate to target
     */
    GOTO = '@APP/goto',
    /**
     * Start app initialization
     */
    INITIALIZE_START = '@APP/initialize/start',
    /**
     * App initialization was successfull
     */
    INITIALIZE_SUCCESS = '@APP/initialize/success',
    /**
     * App initialization has failed
     */
    INITIALIZE_FAILURE = '@APP/initialize/failure',
    /**
     * Start a loader
     */
    LOAD_START = '@APP/load/start',
    /**
     * Stop a loader
     */
    LOAD_STOP = '@APP/load/stop',
    /**
     * Clear all loaders
     */
    LOAD_CLEAR = '@APP/load/clear',
    /**
     * Start an error
     */
    ERROR_START = '@APP/error/start',
    /**
     * Stop an error
     */
    ERROR_STOP = '@APP/error/stop',
    /**
     * Clear all errors
     */
    ERROR_CLEAR = '@APP/error/clear',
    /**
     * Correlation use to identify all actions involved in the app initialization
     */
    INITIALIZE_CORREL = '@APP-initialize',
    /**
     * Correlation use to dispatch an APP.GOTO action
     */
    GOTO_CORREL = '@APP-goto',
    /**
     * Correlation use to dispatch an APP.LOAD_START action
     */
    LOAD_START_CORREL = '@APP-load-start',
    /**
     * Correlation use to dispatch an APP.LOAD_STOP action
     */
    LOAD_STOP_CORREL = '@APP-load-stop',
    /**
     * Correlation use to dispatch an APP.LOAD_CLEAR action
     */
    LOAD_CLEAR_CORREL = '@APP-load-clear',
    /**
     * Correlation use to dispatch an APP.ERROR_START action
     */
    ERROR_START_CORREL = '@APP-error-start',
    /**
     * Correlation use to dispatch an APP.ERROR_STOP action
     */
    ERROR_STOP_CORREL = '@APP-error-stop',
    /**
     * Correlation use to dispatch an APP.ERROR_CLEAR action
     */
    ERROR_CLEAR_CORREL = '@APP-error-clear',
}

/**
 * Interface used to describe all app's action payload and result types and the sync/async state of the action
 * 
 * A sync action should extends [undefined | any, void, false]
 * 
 * An async action should extends [undefined | any, undefined | any, true]
 * 
 */
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

/**
 * Function used to instanciate the app's store configuration 
 */
export function appConfigFactory() {
    return createStoreConfig<AppState, AppSchema>(
        initialAppState,
        {
            // Navigate with Router
            goto: { type: APP.GOTO },
    
            // Request the App to Initialize
            initializeStart: {
                type: APP.INITIALIZE_START,
                correlations: {
                    request: [
                        APP.INITIALIZE_CORREL,
                        { type: APP.LOAD_START_CORREL, data: { message: 'Initialize App ...' } },
                    ]
                }
            },

            // App was initialized successfully
            initializeSuccess: {
                type: APP.INITIALIZE_SUCCESS,
                reducers: {
                    request: (state) => ({ ...state, initialized: true }),
                },
                correlations: { request: [APP.LOAD_STOP_CORREL] }
            },

            // There was an error during the App Initialization
            initializeFailure: {
                type: APP.INITIALIZE_FAILURE,
                reducers: {
                    request: (state) => ({ ...state, initialized: false }),
                },
                correlations: { request: [APP.LOAD_STOP_CORREL] }
            },

            // Start a loader
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

            // Stop a loader
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

            // Clear all pending loaders
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

            // Start an error
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

            // Stop an error
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

            // Clear all pending errors
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

import { ActionsSchema } from "../../ducks-v-2/interfaces/actions-schema";
import { DuckInjector } from "../../ducks-v-2/interfaces/duck-injector";
import { Injectable } from "@angular/core";
import { Duck } from "../../ducks-v-2/classes/duck";
import { DucksService } from "../../ducks-v-2/ducks.service";
import { Action } from "../../ducks-v-2/classes/action";
import { StoreConfig } from "../../ducks-v-2/classes/store-config";
import { UserDuck } from "./user.duck";
import { StorageDuck, StorageEntries } from "./storage.duck";
import { ActionType } from "../../ducks-v-2/types/action.type";
import { ActionConfig } from "../../ducks-v-2/classes/action-config";
import { Effect, ofType } from "@ngrx/effects";
import { mergeMap } from "rxjs/operators";
import { getCorrelationType } from "../../ducks-v-2/tools/async-correlation";

export interface LoadingData {
    message: string;
}

export interface ErrorData {
    name: string;
    message: string;
    stack?: string;
}

export const appSelector = 'app';

export interface AppState {
    ready: boolean;
    loading: boolean;
    error: boolean;
    loadingCount: number;
    errorCount: number;
    loadingData: LoadingData[];
    errorData: ErrorData[];
}

export const initialAppState: AppState = {
    ready: false,
    loading: false,
    error: false,
    loadingCount: 0,
    errorCount: 0,
    loadingData: [],
    errorData: [],
};

export enum APP {
    GOTO = '@app/goto',
    INITIALIZE_REQUEST = '@app/initialize-request',
    INITIALIZE_RESPONSE = '@app/initialize-response',
    SET_READY = '@app/set-ready',
    START_LOADING = '@app/start-loading',
    STOP_LOADING = '@app/stop-loading',
    CLEAR_LOADING = '@app/clear-loading',
    START_ERROR = '@app/start-error',
    STOP_ERROR = '@app/stop-error',
    CLEAR_ERROR = '@app/clear-error',
}

export interface AppSchema extends ActionsSchema {
    initializeRequest: ActionType;
    initializeResponse: ActionType;
    setReady: ActionType<boolean>;
    startLoading: ActionType<LoadingData>;
    stopLoading: ActionType;
    clearLoading: ActionType;
    startError: ActionType<ErrorData>;
    stopError: ActionType;
    clearError: ActionType;
}

export interface AppInjector extends DuckInjector {
    user: UserDuck;
    storage: StorageDuck;
}

export type AppPayloads = undefined;

export function appReducer(state: AppState = initialAppState, { type, payload }: Action<AppPayloads>): AppState {
    switch (type) {
        default:
            return state;
    }
}

@Injectable()
export class AppDuck extends Duck<AppState, AppSchema, AppInjector> {
    constructor(
        public ducks: DucksService,
        public user: UserDuck,
        public storage: StorageDuck,
    ) {
        super(
            { ducks, user, storage },
            {
                goto: new ActionConfig(APP.GOTO),
                initializeRequest: new ActionConfig(APP.INITIALIZE_REQUEST, { correlations: ['@initialize'] }),
                initializeResponse: new ActionConfig(APP.INITIALIZE_RESPONSE),
                setReady: new ActionConfig(APP.SET_READY),
                startLoading: new ActionConfig(APP.START_LOADING),
                stopLoading: new ActionConfig(APP.STOP_LOADING),
                clearLoading: new ActionConfig(APP.CLEAR_LOADING),
                startError: new ActionConfig(APP.START_ERROR),
                stopError: new ActionConfig(APP.STOP_ERROR),
                clearError: new ActionConfig(APP.CLEAR_ERROR),
            },
            new StoreConfig(appSelector, initialAppState, appReducer),
        );
    }

    @Effect({ dispatch: true })
    private initialize$ = this.ducks.actions$.pipe(
        ofType(APP.INITIALIZE_REQUEST),
        mergeMap((action: Action<undefined>) => {
            const init = getCorrelationType(action, '@initialize');
            const getRequest = this.injector.storage.actions.get.createRequest(undefined, [init]);
            const getResolved$ = this.resolved(getRequest);
            const next = (entries: StorageEntries) => {
                if (entries.firstVisit !== false) {

                } else if (!entries.credentials) {

                } else {

                }
            };
        })
    );
}

import { ActionsSchema } from "../../ducks-v-2/interfaces/actions-schema";
import { DuckInjector } from "../../ducks-v-2/interfaces/duck-injector";
import { Injectable } from "@angular/core";
import { Duck } from "../../ducks-v-2/classes/duck";
import { DucksService } from "../../ducks-v-2/ducks.service";
import { Action } from "../../ducks-v-2/classes/action";
import { StoreConfig } from "../../ducks-v-2/classes/store-config";
import { UserDuck, User } from "./user.duck";
import { StorageDuck, StorageEntries } from "./storage.duck";
import { ActionType } from "../../ducks-v-2/types/action.type";
import { ActionConfig } from "../../ducks-v-2/classes/action-config";
import { Effect, ofType } from "@ngrx/effects";
import { mergeMap, switchMap, map, filter, distinctUntilChanged, skip, tap, withLatestFrom } from "rxjs/operators";
import { getCorrelationType, hasCorrelationType } from "../../ducks-v-2/tools/async-correlation";
import { of, concat, from } from "rxjs";
import { Correlation } from "src/ducks-v-2/classes/correlation";

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
    goto: ActionType<string | { target: string, data?: any }>;
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
        case APP.START_LOADING:
            return {
                ...state,
                loading: true,
                loadingCount: state.loadingCount + 1,
                loadingData: [payload, ...state.loadingData]
            };
        case APP.STOP_LOADING:
            return {
                ...state,
                loading: state.loadingCount > 1,
                loadingCount: state.loadingCount - 1,
                loadingData: state.loadingData.slice(1),
            };
        case APP.CLEAR_LOADING:
            return {
                ...state,
                loading: false,
                loadingCount: 0,
                loadingData: [],
            };
        case APP.START_ERROR:
            return {
                ...state,
                error: true,
                errorCount: state.errorCount + 1,
                errorData: [payload, ...state.errorData]
            };
        case APP.STOP_ERROR:
            return {
                ...state,
                error: state.errorCount > 1,
                errorCount: state.errorCount - 1,
                errorData: state.errorData.slice(1),
            };
        case APP.CLEAR_ERROR:
            return {
                ...state,
                error: false,
                errorCount: 0,
                errorData: [],
            };
        case APP.GOTO:
        case APP.INITIALIZE_REQUEST:
        case APP.INITIALIZE_RESPONSE:
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
                initializeResponse: new ActionConfig(APP.INITIALIZE_RESPONSE, { correlations: ['@set-ready'] }),
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
            const app = this.actions;
            const user = this.injector.user.actions;
            const storage = this.injector.storage.actions;

            const init = getCorrelationType(action, '@initialize');

            const goTo = (target: string, data?: any) => of(app.goto.create({ target, data }, [init]));
            const startLoading = app.startLoading.create({ message: 'Initializing App ...' }, [init]);
            const stopLoading = app.stopLoading.create(undefined, [init]);
            const inititializeResponse = app.initializeResponse.create(undefined, [init]);

            const getRequest = storage.get.createRequest(undefined, [init]);

            const next_2 = (nextAction: Action<{ user: User, token: string }>) => goTo(nextAction ? '/home' : 'signin');

            const next_1 = (nextAction: Action<StorageEntries>) => {
                if (!nextAction || nextAction.payload.firstVisit !== false) {
                    return goTo('/tutorial');
                } else if (!nextAction.payload.credentials) {
                    return goTo('/signin');
                } else {
                    const signinRequest = user.authenticate.createRequest(nextAction.payload.credentials, [init]);
                    return concat(
                        of(signinRequest),
                        this.resolved(signinRequest).pipe(switchMap(next_2))
                    );
                }
            };

            return concat(
                from([startLoading, getRequest]),
                this.resolved(getRequest).pipe(switchMap(next_1)),
                from([stopLoading, inititializeResponse]),
            );
        })
    );

    @Effect({ dispatch: true })
    private initalizeResponse$ = this.ducks.actions$.pipe(
        ofType(APP.INITIALIZE_RESPONSE),
        filter((action: Action<AppPayloads>) => hasCorrelationType(action, '@set-ready')),
        map((action: Action<AppPayloads>) => getCorrelationType(action, '@set-ready')),
        map((correlation: Correlation) => this.actions.setReady.create(true, [correlation])),
    );

    @Effect({ dispatch: false })
    private startLoading$ = this.store.loading.pipe(
        distinctUntilChanged(),
        skip(1),
        filter(loading => loading),
        withLatestFrom(this.store.loadingData),
        tap(([, loadingData]) => {
            console.log('Start Loading: ', loadingData);
        })
    );
    @Effect({ dispatch: false })
    private stopLoading$ = this.store.loading.pipe(
        distinctUntilChanged(),
        skip(1),
        filter(loading => !loading),
        tap(() => {
            console.log('Stop Loading.');
        })
    );

    @Effect({ dispatch: false })
    private startError$ = this.store.loading.pipe(
        distinctUntilChanged(),
        skip(1),
        filter(error => error),
        withLatestFrom(this.store.errorData),
        tap(([, errorData]) => {
            console.log('Start Error: ', errorData);
        })
    );
    @Effect({ dispatch: false })
    private stopError$ = this.store.error.pipe(
        distinctUntilChanged(),
        skip(1),
        filter(error => !error),
        tap(() => {
            console.log('Stop Error.');
        })
    );
}

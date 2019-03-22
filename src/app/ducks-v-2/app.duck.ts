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
import { getCorrelationType, hasCorrelationType, isErroredType } from "../../ducks-v-2/tools/async-correlation";
import { of, concat, from } from "rxjs";
import { Correlation } from "src/ducks-v-2/classes/correlation";
import { Router } from "@angular/router";
import { APP } from "../symbols/app.sym";

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
    router: Router
}

export type AppPayloads = undefined | string | { target: string, data?: any } | boolean | LoadingData | ErrorData;

export function appReducer(state: AppState = initialAppState, { type, payload }: Action<AppPayloads>): AppState {
    switch (type) {
        case APP.SET_READY:
            return { ...state, ready: payload as boolean };
        case APP.START_LOADING:
            return {
                ...state,
                loading: true,
                loadingCount: state.loadingCount + 1,
                loadingData: [payload as LoadingData, ...state.loadingData]
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
                errorData: [payload as ErrorData, ...state.errorData]
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
        public router: Router,
    ) {
        super(
            { ducks, user, storage, router },
            {
                goto: new ActionConfig(APP.GOTO),
                initializeRequest: new ActionConfig(APP.INITIALIZE_REQUEST, {
                    correlations: [
                        APP.INIT_CORRELATION,
                        { type: APP.START_LOADING_CORRELATION, data: { loadingData: { message: 'Initializing App ...' } } }
                    ]
                }),
                initializeResponse: new ActionConfig(APP.INITIALIZE_RESPONSE, {
                    correlations: [
                        APP.SET_READY_CORRELATION,
                        APP.STOP_LOADING_CORRELATION
                    ]
                }),
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
    private startAsyncError$ = this.ducks.actions$.pipe(
        filter((action: Action<any>) => isErroredType(action.type)),
        map((action: Action<any>) => {
            return this.actions.startError.create(action.payload, [{ type: '@async-errored', data: action.type }]);
        })
    );

    @Effect({ dispatch: true })
    private initialize$ = this.ducks.actions$.pipe(
        ofType(APP.INITIALIZE_REQUEST),
        mergeMap((action: Action<undefined>) => {
            const app = this.actions;
            const user = this.injector.user.actions;
            const storage = this.injector.storage.actions;

            const init = getCorrelationType(action, APP.INIT_CORRELATION);

            const goTo = (target: string, data?: any) => of(app.goto.create({ target, data }, [init]));
            const inititializeResponse = app.initializeResponse.create(undefined, [init]);

            const getRequest = storage.get.createRequest(undefined, [init]);

            const next_2 = (nextAction: Action<{ user: User, token: string }>) => goTo(nextAction ? '/home' : '/signin');

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
                from([getRequest]),
                this.resolved(getRequest).pipe(switchMap(next_1)),
                from([inititializeResponse]),
            );
        })
    );

    @Effect({ dispatch: true })
    private initalizeResponse$ = this.ducks.actions$.pipe(
        ofType(APP.INITIALIZE_RESPONSE),
        filter((action: Action<AppPayloads>) => hasCorrelationType(action, APP.SET_READY_CORRELATION)),
        map((action: Action<AppPayloads>) => getCorrelationType(action, APP.SET_READY_CORRELATION)),
        map((correlation: Correlation) => this.actions.setReady.create(true, [correlation])),
    );

    @Effect({ dispatch: false })
    private goto$ = this.ducks.actions$.pipe(
        ofType(APP.GOTO),
        tap((action: Action<string | { target: string, data?: any }>) => {
            const { target, data } = typeof(action.payload) === 'string'
                ? { target: action.payload, data: {} }
                : action.payload;
            this.injector.router.navigate([target], { queryParams: data });
        })
    );

    @Effect({ dispatch: true })
    private startLoadingCorrelation$ = this.ducks.actions$.pipe(
        filter((action: Action<any>) => action.type !== APP.START_LOADING),
        filter((action: Action<any>) => hasCorrelationType(action, APP.START_LOADING_CORRELATION)),
        map((action: Action<AppPayloads>) => getCorrelationType(action, APP.START_LOADING_CORRELATION)),
        map((loading: Correlation<{ loadingData: LoadingData }>) => {
            return this.actions.startLoading.create(loading.data ? loading.data.loadingData : undefined, [loading]);
        })
    );

    @Effect({ dispatch: true })
    private stopLoadingCorrelation$ = this.ducks.actions$.pipe(
        filter((action: Action<any>) => action.type !== APP.STOP_LOADING),
        filter((action: Action<any>) => hasCorrelationType(action, APP.STOP_LOADING_CORRELATION)),
        map((action: Action<AppPayloads>) => getCorrelationType(action, APP.STOP_LOADING_CORRELATION)),
        map((loading: Correlation) => {
            return this.actions.stopLoading.create(undefined, [loading]);
        })
    );

    @Effect({ dispatch: true })
    private clearLoadingCorrelation$ = this.ducks.actions$.pipe(
        filter((action: Action<any>) => action.type !== APP.CLEAR_LOADING),
        filter((action: Action<any>) => hasCorrelationType(action, APP.CLEAR_LOADING_CORRELATION)),
        map((action: Action<AppPayloads>) => getCorrelationType(action, APP.CLEAR_LOADING_CORRELATION)),
        map((clear: Correlation) => {
            return this.actions.clearLoading.create(undefined, [clear]);
        })
    );

    @Effect({ dispatch: true })
    private startErrorCorrelation$ = this.ducks.actions$.pipe(
        filter((action: Action<any>) => action.type !== APP.START_ERROR),
        filter((action: Action<any>) => hasCorrelationType(action, APP.START_ERROR_CORRELATION)),
        map((action: Action<AppPayloads>) => getCorrelationType(action, APP.START_ERROR_CORRELATION)),
        map((error: Correlation<{ errorData: ErrorData }>) => {
            return this.actions.startError.create(error.data ? error.data.errorData : undefined, [error]);
        })
    );

    @Effect({ dispatch: true })
    private stopErrorCorrelation$ = this.ducks.actions$.pipe(
        filter((action: Action<any>) => action.type !== APP.STOP_ERROR),
        filter((action: Action<any>) => hasCorrelationType(action, APP.STOP_ERROR_CORRELATION)),
        map((action: Action<AppPayloads>) => getCorrelationType(action, APP.STOP_ERROR_CORRELATION)),
        map((error: Correlation) => {
            return this.actions.stopError.create(undefined, [error]);
        })
    );

    @Effect({ dispatch: true })
    private clearErrorCorrelation$ = this.ducks.actions$.pipe(
        filter((action: Action<any>) => action.type !== APP.CLEAR_ERROR),
        filter((action: Action<any>) => hasCorrelationType(action, APP.CLEAR_ERROR_CORRELATION)),
        map((action: Action<AppPayloads>) => getCorrelationType(action, APP.CLEAR_ERROR_CORRELATION)),
        map((clear: Correlation) => {
            return this.actions.clearError.create(undefined, [clear]);
        })
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
    private startError$ = this.store.error.pipe(
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

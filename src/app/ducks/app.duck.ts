import { Injectable } from "@angular/core";
import { ActionConfigSchemaD } from "src/ducks/interfaces/action-config-schema";
import { StorageDuck, StorageEntries } from "./storage.duck";
import { UserDuck } from "./user.duck";
import { Router } from "@angular/router";
import { ActionConfigTypeD } from "src/ducks/types/action-config-type";
import { Duck } from "src/ducks/models/duck";
import { DucksService } from "src/ducks/ducks.service";
import { StoreConfigD } from "src/ducks/models/store-config";
import { ActionConfigD } from "src/ducks/models/action-config";
import { Effect, ofType } from "@ngrx/effects";
import { mergeMap, skip, distinctUntilChanged, tap, withLatestFrom, switchMap, map, filter, take, takeUntil, finalize } from "rxjs/operators";
import { ActionD } from "src/ducks/models/action";
import { concat, of, from, merge, EMPTY } from "rxjs";
import { getCorrelationType, hasCorrelationTypes, hasCorrelationIds } from "src/ducks/tools/async";
import { SYMD } from "src/ducks/enums/sym";
import { DuckInjectorD } from "src/ducks/interfaces/duck-injector";

export interface AppLoadingData {
  content: string;
}

export interface AppErrorData {
  name: string;
  message: string;
  stack?: string;
}

export const appType = 'app';

export interface AppState {
  ready: boolean;
  loading: boolean;
  loadingCountRef: number;
  loadingData: AppLoadingData[];
  error: boolean;
  errorCountRef: number;
  errorData: AppErrorData[];
}

export const initialAppState: AppState = {
  ready: false,
  loading: false,
  loadingCountRef: 0,
  loadingData: [],
  error: false,
  errorCountRef: 0,
  errorData: []
}

export enum APP_TYPE {
  INITIALIZE_REQUEST = '@app/initialize-request',
  INITIALIZE_RESPONSE = '@app/initialize-response',
  SET_READY = '@app/set-ready',
  START_LOADING = '@app/start-loaidng',
  STOP_LOADING = '@app/stop-loading',
  START_ERROR = '@app/start-error',
  STOP_ERROR = '@app/stop-error',
  GOTO = '@app/go-to',
};

export interface AppSchema extends ActionConfigSchemaD {
  initializeRequest: ActionConfigTypeD;
  initializeResponse: ActionConfigTypeD;
  setReady: ActionConfigTypeD<boolean>;
  startLoading: ActionConfigTypeD<AppLoadingData | undefined>;
  stopLoading: ActionConfigTypeD;
  startError: ActionConfigTypeD<{ error: AppErrorData }>;
  stopError: ActionConfigTypeD;
  goto: ActionConfigTypeD<{ target: string, data?: any }>;
}

export interface AppInjectors extends DuckInjectorD {
  storage: StorageDuck;
  user: UserDuck;
  router: Router;
}

@Injectable()
export class AppDuck extends Duck<AppState, AppSchema, AppInjectors> {
    constructor(
        ducks: DucksService,
        storage: StorageDuck,
        user: UserDuck,
        router: Router,
    ) {
        super({ manager: ducks.manager, storage, user, router },
            new StoreConfigD(appType, initialAppState, (state, action) => {
                switch (action.type) {
                    case APP_TYPE.INITIALIZE_RESPONSE:
                        return { ...state, ready: true };
                    case APP_TYPE.SET_READY:
                        return { ...state, ready: action.payload };
                    case APP_TYPE.START_LOADING:
                        return {
                            ...state,
                            loading: true,
                            loadingCountRef: state.loadingCountRef + 1,
                            loadingData: action.payload ? [action.payload, ...state.loadingData] : state.loadingData,
                        };
                    case APP_TYPE.STOP_LOADING:
                        return {
                            ...state,
                            loading: state.loadingCountRef > 1,
                            loadingCountRef: state.loadingCountRef - 1,
                            loadingData: state.loadingData.slice(1),
                        };
                    case APP_TYPE.START_ERROR:
                        return {
                            ...state,
                            error: true,
                            errorCountRef: state.errorCountRef + 1,
                            errorData: action.payload ? [action.payload, ...state.errorData] : state.errorData,
                        };
                    case APP_TYPE.STOP_ERROR:
                        return {
                            ...state,
                            error: state.errorCountRef > 1,
                            errorCountRef: state.errorCountRef - 1,
                            errorData: state.errorData.slice(1),
                        };
                    case APP_TYPE.INITIALIZE_REQUEST:
                    case APP_TYPE.GOTO:
                    default:
                        return state;
                }
            }),
            {
                initializeRequest: new ActionConfigD(APP_TYPE.INITIALIZE_REQUEST, false, ['app-initialize']),
                initializeResponse: new ActionConfigD(APP_TYPE.INITIALIZE_RESPONSE),
                setReady: new ActionConfigD(APP_TYPE.SET_READY),
                startLoading: new ActionConfigD(APP_TYPE.START_LOADING),
                stopLoading: new ActionConfigD(APP_TYPE.STOP_LOADING),
                startError: new ActionConfigD(APP_TYPE.START_ERROR),
                stopError: new ActionConfigD(APP_TYPE.STOP_ERROR),
                goto: new ActionConfigD(APP_TYPE.GOTO),
            }
        );
    }

    @Effect({ dispatch: true })
    private initialize$ = this.injectors.manager.actions$.pipe(
        ofType(APP_TYPE.INITIALIZE_REQUEST),
        mergeMap((initialize: ActionD<any>) => {
            const appActions = this.actions;
            const userActions = this.injectors.user.actions;
            const storageActions = this.injectors.storage.actions;
            const init = getCorrelationType('app-initialize')(initialize);
            const startLoading = appActions.startLoading.create({ content: 'Initializing App ...' }, [init]);
            const stopLoading = appActions.stopLoading.create(undefined, [init]);
            const initializeResponse = appActions.initializeResponse.create(undefined, [init]);
            const getStorageRequest = storageActions.get.createAsyncRequest(undefined, [init]);
            const getStorageFollowUp$ = merge(
                this.injectors.manager.asyncResolvedOf(getStorageRequest),
                this.injectors.manager.asyncErroredOf(getStorageRequest),
            ).pipe(
                switchMap((getStorageResponse: ActionD<StorageEntries>) => {
                    if (getStorageResponse.payload.firstVisit !== false) {
                        return of(appActions.goto.create({ target: '/tutorial' }, [init]));
                    } else if (!getStorageResponse.payload.credentials) {
                        return of(appActions.goto.create({ target: '/signin' }, [init]));
                    } else {
                        const credentials = getStorageResponse.payload.credentials;
                        const signInRequest = userActions.autoSignIn.createAsyncRequest(credentials, [init]);
                        const signInFollowUp$ = merge(
                            this.injectors.manager.asyncResolvedOf(signInRequest),
                            this.injectors.manager.asyncErroredOf(signInRequest),
                        ).pipe(
                            switchMap(() => {
                                return of(appActions.goto.create({ target: '/home' }, [init]));
                            }),
                        );
                        return concat(of(signInRequest), signInFollowUp$);
                    }
                }),
            );
            return concat(
                from([startLoading, getStorageRequest]),
                getStorageFollowUp$,
                from([stopLoading, initializeResponse])
            );
        }),
    );

    @Effect({ dispatch: false })
    private goto$ = this.injectors.manager.actions$.pipe(
        ofType(APP_TYPE.GOTO),
        tap(({ payload: { target, data } }: ActionD<{ target: string, data?: any }>) => {
            this.injectors.router.navigate([target], data ? { queryParams: data } : {});
        }),
    );

    @Effect({ dispatch: false })
    private loading$ = this.store.selectors.loading.pipe(
        skip(1),
        distinctUntilChanged(),
        withLatestFrom(this.store.selectors.loadingData),
        tap(([loading, datas]) => {
            if (loading) {
                console.log('Start Loading: ', datas);
            } else {
                console.log('Stop Loading.');
            }
        })
    );

    /**
     * @todo: Infinite Action loop bug here
     */
    @Effect({ dispatch: true })
    private asyncLoading$ = this.injectors.manager.actions$.pipe(
        filter((action: ActionD<any>) => action.type !== APP_TYPE.START_LOADING && action.type !== APP_TYPE.STOP_LOADING),
        hasCorrelationTypes('@async-loading'),
        mergeMap((action: ActionD<any>) => {
            const async = getCorrelationType(SYMD.ASYNC_CORRELATION)(action);
            const asyncLoading = getCorrelationType('@async-loading')(action);
            const startLoading = this.actions.startLoading.create(asyncLoading.data, [asyncLoading]);
            const stopLoading = this.actions.stopLoading.create(undefined, [asyncLoading]);
            return concat(
                of(startLoading),
                merge(
                    this.asyncResolvedOf(action).pipe(hasCorrelationIds(async.id)),
                    this.asyncErroredOf(action).pipe(hasCorrelationIds(async.id)),
                    this.asyncCanceledOf(action).pipe(hasCorrelationIds(async.id)),
                ).pipe(take(1), map(() => stopLoading)),
            );
        }),
    );

    @Effect({ dispatch: true })
    private loadingStart$ = this.injectors.manager.actions$.pipe(
        filter((action: ActionD<any>) => action.type !== APP_TYPE.START_LOADING),
        hasCorrelationTypes('@start-loading'),
        map((action: ActionD<any>) => {
            const startLoading = getCorrelationType('@start-loading')(action);
            return this.actions.startLoading.create(startLoading.data, [startLoading]);
        }),
    );

    @Effect({ dispatch: true })
    private loadingStop$ = this.injectors.manager.actions$.pipe(
        filter((action: ActionD<any>) => action.type !== APP_TYPE.STOP_LOADING),
        hasCorrelationTypes('@stop-loading'),
        map((action: ActionD<any>) => {
            const stopLoading = getCorrelationType('@stop-loading')(action);
            return this.actions.stopLoading.create(undefined, [stopLoading]);
        }),
    );
    
    @Effect({ dispatch: false })
    private error$ = this.store.selectors.error.pipe(
        skip(1),
        distinctUntilChanged(),
        withLatestFrom(this.store.selectors.errorData),
        tap(([error, datas]) => {
            if (error) {
                console.log('Start Error: ', datas);
            } else {
                console.log('Stop Error.');
            }
        })
    );

}

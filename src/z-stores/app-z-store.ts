import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { AppState, AppSchema, appSelector, appConfigFactory, APP, AppLoadData, AppErrorData } from "src/z-configs/app-z-config";
import { tap, map, filter, mergeMap, switchMap } from "rxjs/operators";
import { StorageStore } from "./storage-z-store";
import { ZStore, Action } from "src/z/classes";
import { asRequestType, hasCorrelationType, grabCorrelationType, asRequestResolveType } from "src/z/functions";
import { Router } from "@angular/router";
import { concat, of, EMPTY, from } from "rxjs";
import { Entries } from "src/z-configs/storage-z-config";
import { Z_SYMBOL, RESOLVE } from "src/z/enums";
import { AuthStore } from "./auth-z-store";
import { AuthUser, AuthCreds } from "src/z-configs/auth-z-config";

@Injectable()
export class AppStore extends ZStore<AppState, AppSchema> {
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action>,
        public storage: StorageStore,
        public auth: AuthStore,
        public router: Router,
    ) {
        super(store, actions$, appSelector, appConfigFactory());
    }

    /**
     * On APP.INITIALIZE_START:
     *  - load local storage
     *      - on failure APP.GOTO /tutorial + APP.INITIALIZE_FAILURE
     *      - on success
     *          - if firstVisit !== false => APP.GOTO /tutorial + APP.INITIALIZE_SUCCESS
     *          - elif !credentials => APP.GOTO /signin + APP.INITIALIZE_SUCCESS
     *          - else AUTH.AUTHENTICATE
     *              - on failure APP.GOTO /signin + APP.INITIALIZE_SUCCESS
     *              - on success APP.GOTO /home + APP.INITIALIZE_SUCCESS
     */
    @Effect({ dispatch: true })
    protected initialize$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.INITIALIZE_START)),
        mergeMap((initialize: Action) => {
            /**
             * Grab the correlation
             */
            const init = grabCorrelationType(initialize, APP.INITIALIZE_CORREL);
            /**
             * Prepare all possible synchronous actions
             */
            const gotoTutorial = this.zstore.goto.request('/tutorial', [init]);
            const gotoSignin = this.zstore.goto.request('/signin', [init]);
            const gotoSignup = this.zstore.goto.request('/signup', [init]);
            const gotoHome = this.zstore.goto.request('/home', [init]);
            const success = this.zstore.initializeSuccess.request(undefined, [init]);
            const failure = this.zstore.initializeFailure.request(undefined, [init]);
            /**
             * Prepare first asynchronous request/response action
             */
            const getStorageReq = this.storage.zstore.get.request(undefined, [init]);
            const getStorageRes$ = this.finish(getStorageReq);
            /**
             * Prepare first followup
             */
            const switchGetStorageResFn = ({ status, action }: { status: string, action: Action<Entries<any>> }) => {
                /**
                 * Prepare second asynchronous request/response action
                 */
                const authenticateReq = this.auth.zstore.authenticate.request(action.payload.credentials, [init]);
                const authenticateRes$ = this.finish(authenticateReq);
                /**
                 * Prepare second followup
                 */
                const switchAuthenticateResFn = ({ status }) => from([status === RESOLVE ? gotoHome : gotoSignin, success]);
                if (status !== RESOLVE) {
                    return from([gotoTutorial, failure]);
                } else if (!action.payload.credentials) {
                    return from([action.payload.firstVisit === false ? gotoSignup : gotoSignin, success]);
                }
                /**
                 * Dispatch second asynchronous request/response action + second followup
                 */
                return concat(of(authenticateReq), authenticateRes$.pipe(switchMap(switchAuthenticateResFn)));
            };
            /**
             * Dispatch first asynchronous request/response action + first followup
             */
            return concat(of(getStorageReq), getStorageRes$.pipe(switchMap(switchGetStorageResFn)));
        }),
    );

    // On APP.GOTO use Router
    @Effect({ dispatch: false })
    protected goto$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.GOTO)),
        tap((action: Action<string | { target: string, data?: any }>) => {
            const { target, data } = typeof(action.payload) === 'string'
                ? { target: action.payload, data: undefined }
                : action.payload;
            this.router.navigate([target], { queryParams: data });
        }),
    );

    // Log load start actions
    @Effect({ dispatch: false })
    protected loadStart$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.LOAD_START)),
        tap((action: Action<undefined | string | AppLoadData>) => {
            console.log('AppStore@Effect.loadStart$: Load Start: ', action.payload);
        }),
    );

    // Log load stop actions
    @Effect({ dispatch: false })
    protected loadStop$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.LOAD_STOP)),
        tap((action: Action<undefined>) => {
            console.log('AppStore@Effect.loadStop$: Load Stop.');            
        }),
    );

    // Log load clear actions
    @Effect({ dispatch: false })
    protected loadClear$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.LOAD_CLEAR)),
        tap((action: Action<undefined>) => {
            console.log('AppStore@Effect.loadClear$: Load Clear.');
        }),
    );
    
    // Log error start actions
    @Effect({ dispatch: false })
    protected errorStart$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.ERROR_START)),
        tap((action: Action<string | AppErrorData>) => {
            console.log('AppStore@Effect.errorStart$: Error Start: ', action.payload);
        }),
    );

    // Log error stop actions
    @Effect({ dispatch: false })
    protected errorStop$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.ERROR_STOP)),
        tap((action: Action<undefined>) => {
            console.log('AppStore@Effect.errorStop$: Error Stop.');            
        }),
    );

    // Log error clear actions
    @Effect({ dispatch: false })
    protected errorClear$ = this.actions$.pipe(
        ofType(asRequestResolveType(APP.ERROR_CLEAR)),
        tap((action: Action<undefined>) => {
            console.log('AppStore@Effect.errorClear$: Error Clear.');
        }),
    );

    // If APP.GOTO_CORREL is use, dispatch an APP.GOTO
    @Effect({ dispatch: true })
    protected gotoCorrelation$ = this.actions$.pipe(
        hasCorrelationType(APP.GOTO_CORREL),
        filter((action: Action) => !action.type.includes(APP.GOTO)),
        map(action => grabCorrelationType(action, APP.GOTO_CORREL)),
        filter(correlation => !!correlation && !!correlation.data),
        map(correlation => this.zstore.goto.request(correlation.data, [correlation]))
    );

    // If APP.LOAD_START_CORREL is use, dispatch an APP.LOAD_START
    @Effect({ dispatch: true })
    protected loadStartCorrelation$ = this.actions$.pipe(
        hasCorrelationType(APP.LOAD_START_CORREL),
        filter((action: Action) => !action.type.includes(APP.LOAD_START)),
        map(action => grabCorrelationType(action, APP.LOAD_START_CORREL)),
        map(correlation => this.zstore.loadStart.request(correlation.data, [correlation]))
    );

    // If APP.LOAD_STOP_CORREL is use, dispatch an APP.LOAD_STOP
    @Effect({ dispatch: true })
    protected loadStopCorrelation$ = this.actions$.pipe(
        hasCorrelationType(APP.LOAD_STOP_CORREL),
        filter((action: Action) => !action.type.includes(APP.LOAD_STOP)),
        map(action => grabCorrelationType(action, APP.LOAD_STOP_CORREL)),
        map(correlation => this.zstore.loadStop.request(undefined, [correlation]))
    );
    
    // If APP.LOAD_CLEAR_CORREL is use, dispatch an APP.LOAD_CLEAR
    @Effect({ dispatch: true })
    protected loadClearCorrelation$ = this.actions$.pipe(
        hasCorrelationType(APP.LOAD_CLEAR_CORREL),
        filter((action: Action) => !action.type.includes(APP.LOAD_CLEAR)),
        map(action => grabCorrelationType(action, APP.LOAD_CLEAR_CORREL)),
        map(correlation => this.zstore.loadClear.request(undefined, [correlation]))
    );

    // If APP.ERROR_START_CORREL is use, dispatch an APP.ERROR_START
    @Effect({ dispatch: true })
    protected errorStartCorrelation$ = this.actions$.pipe(
        hasCorrelationType(APP.ERROR_START_CORREL),
        filter((action: Action) => !action.type.includes(APP.ERROR_START)),
        map(action => grabCorrelationType(action, APP.ERROR_START_CORREL)),
        map(correlation => this.zstore.errorStart.request(correlation.data, [correlation]))
    );

    // If APP.ERROR_STOP_CORREL is use, dispatch an APP.ERROR_STOP
    @Effect({ dispatch: true })
    protected errorStopCorrelation$ = this.actions$.pipe(
        hasCorrelationType(APP.ERROR_STOP_CORREL),
        filter((action: Action) => !action.type.includes(APP.ERROR_STOP)),
        map(action => grabCorrelationType(action, APP.ERROR_STOP_CORREL)),
        map(correlation => this.zstore.errorStop.request(undefined, [correlation]))
    );

    // If APP.ERROR_CLEAR_CORREL is use, dispatch an APP.ERROR_CLEAR
    @Effect({ dispatch: true })
    protected errorClearCorrelation$ = this.actions$.pipe(
        hasCorrelationType(APP.ERROR_CLEAR_CORREL),
        filter((action: Action) => !action.type.includes(APP.ERROR_CLEAR)),
        map(action => grabCorrelationType(action, APP.ERROR_CLEAR_CORREL)),
        map(correlation => this.zstore.errorClear.request(undefined, [correlation]))
    );
}
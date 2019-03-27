import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { AuthState, AuthSchema, authSelector, authConfigFactory, AUTH, AuthCreds } from "src/z-configs/auth-z-config";
import { MockUserService } from "src/app/services/mock-user/mock-user.service";
import { map } from "rxjs/operators";
import { StorageStore } from "./storage-z-store";
import { ZStore, Action } from "src/z/classes";
import { asResolveType, hasCorrelationType, grabCorrelationType, asErrorType, asRequestType, asRequestResolveType } from "src/z/functions";

@Injectable()
export class AuthStore extends ZStore<AuthState, AuthSchema> {
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action>,
        public auth: MockUserService,
        public storage: StorageStore,
    ) {
        super(store, actions$, authSelector, authConfigFactory(auth));
    }

    // Set the credentials object after a success authentication (if AUTH.SET_CREDS_CORREL is used)
    @Effect({ dispatch: true })
    protected setCredentials$ = this.actions$.pipe(
        ofType(asResolveType(AUTH.AUTHENTICATE)),
        hasCorrelationType(AUTH.SET_CREDS_CORREL),
        map((action: Action<{ credentials: AuthCreds }>) => this.zstore.setCreds.request(
            action.payload.credentials, [
                grabCorrelationType(action, AUTH.SET_CREDS_CORREL),
                grabCorrelationType(action, AUTH.SAVE_CREDS_CORREL),
            ]
        )),
    );

    // Delete the credentials object after a failure authentication (if AUTH.DEL_CREDS_CORREL is used)
    // Delete the credentials object a succes revoking (if AUTH.DEL_CREDS_CORREL is used)
    @Effect({ dispatch: true })
    protected delCredentials$ = this.actions$.pipe(
        ofType(asErrorType(AUTH.AUTHENTICATE), asResolveType(AUTH.REVOKE)),
        hasCorrelationType(AUTH.DEL_CREDS_CORREL),
        map((action: Action<Error> | Action<undefined>) => this.zstore.delCreds.request(
            undefined, [
                grabCorrelationType(action, AUTH.DEL_CREDS_CORREL),
                grabCorrelationType(action, AUTH.REMOVE_CREDS_CORREL),
            ]
        )),
    );

    // Save the credentials object to local storage if AUTH.SET_CREDS uses AUTH.SAVE_CREDS_CORREL
    @Effect({ dispatch: true })
    protected saveCredentials$ = this.actions$.pipe(
        ofType(asRequestResolveType(AUTH.SET_CREDS)),
        hasCorrelationType(AUTH.SAVE_CREDS_CORREL),
        map((action: Action<AuthCreds>) => this.storage.zstore.save.request(
            { credentials: action.payload }, [grabCorrelationType(action, AUTH.SAVE_CREDS_CORREL)]
        )),
    );

    // Remove the credentials object from local storage if AUTH.DEL_CREDS uses AUTH.REMOVE_CREDS_CORREL
    @Effect({ dispatch: true })
    protected removeCredentials$ = this.actions$.pipe(
        ofType(asRequestResolveType(AUTH.DEL_CREDS)),
        hasCorrelationType(AUTH.REMOVE_CREDS_CORREL),
        map((action: Action<undefined>) => this.storage.zstore.remove.request(
            ['credentials'], [grabCorrelationType(action, AUTH.REMOVE_CREDS_CORREL)]
        )),
    );
}

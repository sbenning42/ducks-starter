import { StorageDuck } from "./storage.duck";
import { MockUserService } from "../services/mock-user/mock-user.service";
import { ActionConfigSchemaD } from "src/ducks/interfaces/action-config-schema";
import { Injectable } from "@angular/core";
import { Duck } from "src/ducks/models/duck";
import { DucksService } from "src/ducks/ducks.service";
import { StoreConfigD } from "src/ducks/models/store-config";
import { ActionConfigTypeD } from "src/ducks/types/action-config-type";
import { ActionConfigD } from "src/ducks/models/action-config";
import { Effect, ofType } from "@ngrx/effects";
import { map } from "rxjs/operators";
import { ActionD } from "src/ducks/models/action";
import { hasCorrelationTypes, getCorrelationType, createAsyncResolvedType } from "src/ducks/tools/async";

export const userType = 'user';

export interface User {
    id: string;
    email: string;
    password: string;
}

export interface UserCred {
    email: string;
    password: string;
}

export interface UserState {
    authentified: boolean;
    credentials: UserCred;
    user: User;
    token: string;
}

export const initialUserState: UserState = {
    authentified: false,
    credentials: null,
    user: null,
    token: null,
};

export interface UserInjectors {
    storage: StorageDuck;
    user: MockUserService;
}

export enum USER_TYPE {
    SET_CREDENTIALS = '@user/set-credentials',
    REMOVE_CREDENTIALS = '@user/remove-credentials',
    SIGN_UP = '@user/sign-up',
    SIGN_IN = '@user/sign-in',
    SIGN_OUT = '@user/sign-out',
    AUTO_SIGN_IN = '@user/auto-sign-in',
}

export interface UserSchema extends ActionConfigSchemaD {
    setCredentials: ActionConfigTypeD<UserCred>,
    removeCredentials: ActionConfigTypeD,
    signUp: ActionConfigTypeD<Partial<User>, User>,
    signIn: ActionConfigTypeD<UserCred, { user: User, token: string }>,
    signOut: ActionConfigTypeD<string, {}>,
    autoSignIn: ActionConfigTypeD<UserCred, { user: User, token: string }>,
}

@Injectable()
export class UserDuck extends Duck<UserState, UserSchema, UserInjectors> {
    constructor(
        ducks: DucksService,
        storage: StorageDuck,
        user: MockUserService,
    ) {
        super(
            ducks.manager,
            { storage, user },
            new StoreConfigD(userType, initialUserState, (state, action) => {
                switch (action.type) {
                    case USER_TYPE.SET_CREDENTIALS:
                        return { ...state, credentials: action.payload };
                    case USER_TYPE.REMOVE_CREDENTIALS:
                        return { ...state, credentials: null };
                    case createAsyncResolvedType(USER_TYPE.SIGN_UP):
                        return { ...state, user: action.payload };
                    case createAsyncResolvedType(USER_TYPE.AUTO_SIGN_IN):
                    case createAsyncResolvedType(USER_TYPE.SIGN_IN):
                        return { ...state, authentified: true, user: action.payload.user, token: action.payload.token };
                    case createAsyncResolvedType(USER_TYPE.SIGN_OUT):
                        return { ...state, authentified: false, user: null, token: null };
                    default:
                        return state;
                }
            }),
            {
                setCredentials: new ActionConfigD(USER_TYPE.SET_CREDENTIALS, false, ['save-storage']),
                removeCredentials: new ActionConfigD(USER_TYPE.REMOVE_CREDENTIALS, false, ['remove-storage']),
                signUp: new ActionConfigD(USER_TYPE.SIGN_UP, true, [], payload => this.injectors.user.signup(payload)),
                signIn: new ActionConfigD(USER_TYPE.SIGN_IN, true, [], payload => this.injectors.user.signin(payload)),
                signOut: new ActionConfigD(USER_TYPE.SIGN_OUT, true, [], payload => this.injectors.user.signout(payload)),
                autoSignIn: new ActionConfigD(USER_TYPE.AUTO_SIGN_IN, true, [], payload => this.injectors.user.signin(payload)),
            }
        );
    }

    @Effect({ dispatch: true })
    private setCredentialsOnSignIn$ = this.ducks.actions$.pipe(
        ofType(
            createAsyncResolvedType(USER_TYPE.SIGN_IN),
            createAsyncResolvedType(USER_TYPE.AUTO_SIGN_IN)
        ),
        map((action: ActionD<UserCred>) => this.actionsManager.setCredentials.create(action.payload, ['sign-in-resolved'])),
    );

    @Effect({ dispatch: true })
    private saveCredentials$ = this.ducks.actions$.pipe(
        ofType(USER_TYPE.SET_CREDENTIALS),
        hasCorrelationTypes('save-storage'),
        map((action: ActionD<UserCred>) => this.injectors.storage.actionsManager.save.createAsyncRequest({
            credentials: action.payload
        }, [getCorrelationType('save-storage')(action)])),
    );

    @Effect({ dispatch: true })
    private removeCredentials$ = this.ducks.actions$.pipe(
        ofType(USER_TYPE.REMOVE_CREDENTIALS),
        hasCorrelationTypes('remove-storage'),
        map((action: ActionD<UserCred>) => this.injectors.storage.actionsManager.remove.createAsyncRequest([
            'credentials',
        ], [getCorrelationType('remove-storage')(action)])),
    );
}

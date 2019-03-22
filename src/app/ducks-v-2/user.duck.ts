import { DuckInjector } from "../../ducks-v-2/interfaces/duck-injector";
import { ActionsSchema } from "../../ducks-v-2/interfaces/actions-schema";
import { MockUserService } from "../services/mock-user/mock-user.service";
import { StorageDuck } from "./storage.duck";
import { ActionType } from "../../ducks-v-2/types/action.type";
import { Injectable } from "@angular/core";
import { Duck } from "../../ducks-v-2/classes/duck";
import { StoreConfig } from "../../ducks-v-2/classes/store-config";
import { Action } from "../../ducks-v-2/classes/action";
import { ActionConfig } from "../../ducks-v-2/classes/action-config";
import { DucksService } from "../../ducks-v-2/ducks.service";
import { ofType, Effect } from "@ngrx/effects";
import { filter, map } from "rxjs/operators";
import { hasCorrelationType, getCorrelationType, resolvedType } from "../../ducks-v-2/tools/async-correlation";
import { SYMBOL } from "src/ducks-v-2/enums/symbol";
import { APP } from "../symbols/app.sym";
import { USER } from "../symbols/user.sym";

export interface UserCredentials {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    password: string;
}

export const userSelector = 'user';

export interface UserState {
    authentified: boolean;
    credentials: UserCredentials;
    user: User;
    token: string;
}

export const initialUserState: UserState = {
    authentified: false,
    credentials: null,
    user: null,
    token: null,
};

export interface UserSchema extends ActionsSchema {
    setCredentials: ActionType<UserCredentials>;
    removeCredentials: ActionType;
    register: ActionType<Partial<User>, User>;
    authenticate: ActionType<UserCredentials, { user: User, token: string }>;
    revoke: ActionType<{ id: string, token: string }, {}>;
}

export type UserPayloads = UserCredentials | Partial<User> | User | undefined | { id: string, token: string } | { user: User, token: string } | { };

export interface UserInjector extends DuckInjector {
    user: MockUserService;
    storage: StorageDuck;
}

export function userReducer(state: UserState = initialUserState, { type, payload }: Action<UserPayloads>): UserState {
    switch (type) {
        case USER.SET_CREDENTIALS:
            return { ...state, credentials: payload as UserCredentials };
        case USER.REMOVE_CREDENTIALS:
            return { ...state, credentials: null };
        case resolvedType(USER.REGISTER):
            return { ...state, user: payload as User };
        case resolvedType(USER.AUTHENTICATE):
            return {
                ...state,
                authentified: true,
                user: (payload as { user: User, token: string }).user,
                token: (payload as { user: User, token: string }).token
            };
        case resolvedType(USER.REVOKE):
            return { ...state, authentified: false, user: null, token: null };
        default:
            return state;
    }
}

@Injectable()
export class UserDuck extends Duck<UserState, UserSchema, UserInjector> {
    constructor(
        public ducks: DucksService,
        public user: MockUserService,
        public storage: StorageDuck,
    ) {
        super(
            { ducks, user, storage },
            {
                setCredentials: new ActionConfig(USER.SET_CREDENTIALS, { correlations: [USER.SAVE_CREDENTIALS_CORRELATION] }),
                removeCredentials: new ActionConfig(USER.REMOVE_CREDENTIALS, { correlations: [USER.REMOVE_CREDENTIALS_CORRELATION] }),
                register: new ActionConfig(USER.REGISTER, {
                    isAsync: true,
                    handler: (payload: Partial<User>) => this.user.signup(payload),
                    correlations: [
                        { type: APP.START_LOADING_CORRELATION, data: { loadingData: { message: 'User Register ...' } } },
                        { type: APP.STOP_LOADING_CORRELATION, data: { for: `${SYMBOL.RESOLVED} ${SYMBOL.ERRORED} ${SYMBOL.CANCELED}` } }
                    ]
                }),
                authenticate: new ActionConfig(USER.AUTHENTICATE, {
                    isAsync: true,
                    handler: (payload: UserCredentials) => this.user.signin(payload),
                    correlations: [
                        { type: APP.START_LOADING_CORRELATION, data: { loadingData: { message: 'User Authenticate ...' } } },
                        { type: APP.STOP_LOADING_CORRELATION, data: { for: `${SYMBOL.RESOLVED} ${SYMBOL.ERRORED} ${SYMBOL.CANCELED}` } },
                        { type: USER.SET_CREDENTIALS_CORRELATION, data: { for: SYMBOL.RESOLVED } }
                    ]
                }),
                revoke: new ActionConfig(USER.REVOKE, {
                    isAsync: true,
                    handler: ({ id }: { id: string, token: string }) => this.user.signout(id),
                    correlations: [
                        { type: APP.START_LOADING_CORRELATION, data: { loadingData: { message: 'User Revoke ...' } } },
                        { type: APP.STOP_LOADING_CORRELATION, data: { for: `${SYMBOL.RESOLVED} ${SYMBOL.ERRORED} ${SYMBOL.CANCELED}` } }
                    ]
                }),
            },
            new StoreConfig<UserState>(userSelector, initialUserState, userReducer),
        );
    }

    @Effect({ dispatch: true })
    private setCredentials$ = this.ducks.actions$.pipe(
        ofType(resolvedType(USER.AUTHENTICATE)),
        filter((action: Action<{ user: User, token: string }>) => hasCorrelationType(action, USER.SET_CREDENTIALS_CORRELATION)),
        map((action: Action<{ user: User, token: string }>) => {
            const correlation = getCorrelationType(action, USER.SET_CREDENTIALS_CORRELATION);
            const credentials = {
                email: action.payload.user.email,
                password: action.payload.user.password,
            };
            return this.actions.setCredentials.create(credentials, [correlation]);
        })
    );

    @Effect({ dispatch: true })
    private saveCredentials$ = this.ducks.actions$.pipe(
        ofType(USER.SET_CREDENTIALS),
        filter((action: Action<UserCredentials>) => hasCorrelationType(action, USER.SAVE_CREDENTIALS_CORRELATION)),
        map((action: Action<UserCredentials>) => {
            const correlation = getCorrelationType(action, USER.SAVE_CREDENTIALS_CORRELATION);
            return this.injector.storage.actions.save.createRequest({ credentials: action.payload }, [correlation]);
        })
    );

    @Effect({ dispatch: true })
    private removeCredentials$ = this.ducks.actions$.pipe(
        ofType(USER.SET_CREDENTIALS),
        filter((action: Action<UserCredentials>) => hasCorrelationType(action, USER.REMOVE_CREDENTIALS_CORRELATION)),
        map((action: Action<UserCredentials>) => {
            const correlation = getCorrelationType(action, USER.REMOVE_CREDENTIALS_CORRELATION);
            return this.injector.storage.actions.remove.createRequest(['credentials'], [correlation]);
        }),
    );
}

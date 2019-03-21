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

export enum USER {
    SET_CREDENTIALS = '@user/set-credentials',
    REMOVE_CREDENTIALS = '@user/remove-credentials',
    REGISTER = '@user/register',
    AUTHENTICATE = '@user/authenticate',
    REVOKE = '@user/revoke',
}

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

export function userReducer(state: UserState, { type, payload }: Action<UserPayloads>): UserState {
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
                setCredentials: new ActionConfig(USER.SET_CREDENTIALS, { correlations: ['@save-storage'] }),
                removeCredentials: new ActionConfig(USER.REMOVE_CREDENTIALS, { correlations: ['@remove-storage'] }),
                register: new ActionConfig(USER.REGISTER, {
                    isAsync: true,
                    handler: (payload: Partial<User>) => this.user.signup(payload),
                }),
                authenticate: new ActionConfig(USER.AUTHENTICATE, {
                    isAsync: true,
                    handler: (payload: UserCredentials) => this.user.signin(payload),
                }),
                revoke: new ActionConfig(USER.REVOKE, {
                    isAsync: true,
                    handler: ({ id }: { id: string, token: string }) => this.user.signout(id),
                }),
            },
            new StoreConfig<UserState>(userSelector, initialUserState, userReducer),
        );
    }

    @Effect({ dispatch: true })
    private saveCredentials$ = this.ducks.actions$.pipe(
        ofType(USER.SET_CREDENTIALS),
        filter((action: Action<UserCredentials>) => hasCorrelationType(action, '@save-storage')),
        map((action: Action<UserCredentials>) => {
            const correlation = getCorrelationType(action, '@save-storage');
            return this.injector.storage.actions.save.createRequest({ credentials: action.payload }, [correlation]);
        })
    );

    @Effect({ dispatch: true })
    private removeCredentials$ = this.ducks.actions$.pipe(
        ofType(USER.SET_CREDENTIALS),
        filter((action: Action<UserCredentials>) => hasCorrelationType(action, '@remove-storage')),
        map((action: Action<UserCredentials>) => {
            const correlation = getCorrelationType(action, '@remove-storage');
            return this.injector.storage.actions.remove.createRequest(['credentials'], [correlation]);
        }),
    );
}

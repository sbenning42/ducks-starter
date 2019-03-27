import { MockUserService } from "src/app/services/mock-user/mock-user.service";
import { map } from "rxjs/operators";
import { BaseSchema } from "src/z/types";
import { createStoreConfig } from "src/z/functions";
import { baseAsyncCorrelations } from "./base-async-correlations";

export const authSelector = 'AUTH';

export interface AuthCreds {
    email: string;
    password: string;
}
export interface AuthUser {
    id: string;
    email: string;
    password: string;
}

export interface AuthState {
    authenticated: boolean;
    credentials: AuthCreds;
    user: AuthUser;
    token: string;
}

export const initialAuthState: AuthState = {
    authenticated: false,
    credentials: null,
    user: null,
    token: null,
};

export enum AUTH {
    SET_CREDS = '@AUTH/set-credentials',
    DEL_CREDS = '@AUTH/delete-credentials',
    REGISTER = '@AUTH/register',
    AUTHENTICATE = '@AUTH/authenticate',
    REVOKE = '@AUTH/revoke',
    SET_CREDS_CORREL = '@AUTH-set-credentials',
    DEL_CREDS_CORREL = '@AUTH-del-credentials',
    SAVE_CREDS_CORREL = '@AUTH-save-credentials',
    REMOVE_CREDS_CORREL = '@AUTH-remove-credentials',
}

export interface AuthSchema extends BaseSchema {
    setCreds: [AuthCreds, void, false];
    delCreds: [undefined, void, false];
    register: [Partial<AuthUser>, AuthUser, true];
    authenticate: [AuthCreds, { credentials: AuthCreds, user: AuthUser, token: string }, true];
    revoke: [string, {}, true];
}

export function authConfigFactory(
    auth: MockUserService,
) {
    return createStoreConfig<AuthState, AuthSchema>(
        initialAuthState,
        {

            // Set the credentials object
            setCreds: {
                type: AUTH.SET_CREDS,
                reducers: {
                    request: (state, payload) => ({
                        ...state,
                        credentials: payload,
                    }),
                },
                correlations: {
                    resolve: [AUTH.SAVE_CREDS_CORREL]
                }
            },

            // Delete the credentials object
            delCreds: {
                type: AUTH.DEL_CREDS,
                reducers: {
                    request: (state, payload) => ({
                        ...state,
                        credentials: payload,
                    }),
                },
                correlations: {
                    resolve: [AUTH.REMOVE_CREDS_CORREL]
                }
            },

            // Register a new user
            register: {
                type: AUTH.REGISTER,
                async: true,
                handler: payload => auth.signup(payload),
                reducers: {
                    resolve: (state, payload) => ({
                        ...state,
                        user: payload,
                    }),
                },
                correlations: baseAsyncCorrelations(
                    'Register User ...',
                    'Cannot Register User ...'
                ),
            },

            // Authenticate an user
            authenticate: {
                type: AUTH.AUTHENTICATE,
                async: true,
                handler: payload => auth.signin(payload).pipe(map(resp => ({ ...resp, credentials: payload }))),
                reducers: {
                    resolve: (state, payload) => ({
                        ...state,
                        authenticated: true,
                        user: payload.user,
                        token: payload.token,
                    }),
                },
                correlations: baseAsyncCorrelations(
                    'Authenticate User ...',
                    'Cannot Authenticate User ...',
                    {
                        resolve: [
                            AUTH.SET_CREDS_CORREL,
                            AUTH.SAVE_CREDS_CORREL
                        ],
                        error: [
                            AUTH.DEL_CREDS_CORREL,
                            AUTH.REMOVE_CREDS_CORREL
                        ]
                    }
                ),
            },

            // Revoke an authenticated user
            revoke: {
                type: AUTH.REVOKE,
                async: true,
                handler: payload => auth.signout(payload),
                reducers: {
                    resolve: (state, payload) => ({
                        ...state,
                        authenticated: false,
                        user: null,
                        token: null,
                    }),
                },
                correlations: baseAsyncCorrelations(
                    'Revoke User ...',
                    'Cannot Revoke User ...',
                    {
                        resolve: [
                            AUTH.DEL_CREDS_CORREL,
                            AUTH.REMOVE_CREDS_CORREL
                        ]
                    }
                ),
            },
        }
    );
}

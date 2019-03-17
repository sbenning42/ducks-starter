import { MockUser, MockUserService } from '../services/mock-user/mock-user.service';
import { StorageBone } from './storage.bone';
import { SchemaBGL, hasCorrelationTypes } from 'src/beagle/classes/beagle';
import { Injectable } from '@angular/core';
import { BoneBGL } from 'src/beagle/classes/bone-bgl';
import { BeagleService } from 'src/beagle/beagle.service';
import { RawStoreConfigBGL } from 'src/beagle/classes/raw-store-config-bgl';
import { ActionConfigBGL } from 'src/beagle/classes/action-config-bgl';
import { makeResolvedTypeBGL, makeRequestTypeBGL } from 'src/beagle/classes/async-actions-factory-bgl';
import { Effect, ofType } from '@ngrx/effects';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { ActionBGL } from 'src/beagle/classes/action-bgl';
import { concat, from } from 'rxjs';

export type User = MockUser;

export const userType = 'user';

export interface UserState {
  authentified: boolean;
  credentials: boolean;
  user: User;
  token: string;
}

export const initialUserState: UserState = {
  authentified: false,
  credentials: null,
  user: null,
  token: null,
};

export interface UserSchema extends SchemaBGL {
  setCredentials: [Partial<User>];
  removeCredentials: [undefined];
  signup: [Partial<User>, User];
  signin: [Partial<User>, { user: User, token: string }];
  signout: [string, {}];
}

export enum UserActionType  {
  setCredentials = '@user/set-credentials',
  removeCredentials = '@user/remove-credentials',
  signup = '@user/sign-up',
  signin = '@user/sign-in',
  signout = '@user/sign-out',
}

export interface UserInjector {
  user: MockUserService;
  storage: StorageBone;
}

@Injectable()
export class UserBone extends BoneBGL<UserState, UserSchema, UserInjector> {
  constructor(beagle: BeagleService, user: MockUserService, storage: StorageBone) {
    super(beagle, { user, storage }, beagle.createFeatureStore<UserState, UserSchema>(
      {
        setCredentials: new ActionConfigBGL(
          UserActionType.setCredentials, [], payload => storage.actions.save.dispatchRequest({ credentials: payload })
        ),
        removeCredentials: new ActionConfigBGL(
          UserActionType.removeCredentials, [], () => storage.actions.remove.dispatchRequest(['credentials'])
        ),
        signup: new ActionConfigBGL(
          UserActionType.signup, ['async'], payload => user.signup(payload)
        ),
        signin: new ActionConfigBGL(
          UserActionType.signin, ['async'], payload => user.signin(payload)
        ),
        signout: new ActionConfigBGL(
          UserActionType.signout, ['async'], payload => user.signout(payload)
        ),
      },
      new RawStoreConfigBGL<UserState>(userType, initialUserState, (state, action) => {
        switch (action.type) {
          case UserActionType.setCredentials:
            return { ...state, credentials: action.payload };
          case UserActionType.removeCredentials:
            return { ...state, credentials: null };
          case makeResolvedTypeBGL(UserActionType.signup):
            return { ...state, user: action.payload };
          case makeResolvedTypeBGL(UserActionType.signin):
            return { ...state, authentified: true, user: action.payload.user, token: action.payload.token };
          case makeResolvedTypeBGL(UserActionType.signout):
            return { ...state, authentified: false, user: null, token: null };
          default:
            return state;
        }
      })
    ));
  }

  @Effect({ dispatch: true })
  private saveCredentials$ = this.beagle.actions$.pipe(
    ofType(UserActionType.setCredentials),
    map((action: ActionBGL<Partial<User>>) => this.injectors.storage.actions.save.createRequest({ credentials: action.payload })),
  );
  @Effect({ dispatch: true })
  private removeCredentials$ = this.beagle.actions$.pipe(
    ofType(UserActionType.removeCredentials),
    map((action: ActionBGL<undefined>) => this.injectors.storage.actions.remove.createRequest(['credentials'])),
  );
  @Effect({ dispatch: true })
  private signinFromPageSigninComponent$ = this.beagle.actions$.pipe(
    ofType(makeRequestTypeBGL(UserActionType.signin)),
    hasCorrelationTypes('PageSigninComponent@signin'),
    mergeMap((signinRequest: ActionBGL<User>) => {
      const correlation = signinRequest.correlations.find(correlation => correlation.type === 'PageSigninComponent@signin');
      return this.asyncResolved(signinRequest).pipe(
        switchMap(() => {
          const setCredentials = this.actions.setCredentials.create(signinRequest.payload, [correlation]);
          const goto = this.beagle.getBone<BoneBGL<{}, { goto: [{ target: string }] }>>('app')
            .actions.goto.create({ target: '/home' }, [correlation]);
          return from([setCredentials, goto]);
        }),
      );
    }),
  );
}

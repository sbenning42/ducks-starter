import { MockUser, MockUserService } from '../services/mock-user/mock-user.service';
import { StorageBone } from './storage.bone';
import { SchemaBGL } from 'src/beagle/classes/beagle';
import { Injectable } from '@angular/core';
import { BoneBGL } from 'src/beagle/classes/bone-bgl';
import { BeagleService } from 'src/beagle/beagle.service';
import { RawStoreConfigBGL } from 'src/beagle/classes/raw-store-config-bgl';
import { ActionConfigBGL } from 'src/beagle/classes/action-config-bgl';
import { makeRequestTypeBGL } from 'src/beagle/classes/async-actions-factory-bgl';
import { Effect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { ActionBGL } from 'src/beagle/classes/action-bgl';

export type User = MockUser;

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
  setCredentials = '[User Action Type] Set Credentials',
  removeCredentials = '[User Action Remove Credentials] ',
  signup = '[User Action Type] Sign Up',
  signin = '[User Action Type] Sign In',
  signout = '[User Action Type] Sign Out',
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
      new RawStoreConfigBGL<UserState>('user', initialUserState, (state, action) => {
        switch (action.type) {
          case UserActionType.setCredentials:
            return { ...state, credentials: action.payload };
          case UserActionType.removeCredentials:
            return { ...state, credentials: null };
          case makeRequestTypeBGL(UserActionType.signup):
            return { ...state, user: action.payload };
          case makeRequestTypeBGL(UserActionType.signin):
            return { ...state, authentified: true, user: action.payload.user, token: action.payload.token };
          case makeRequestTypeBGL(UserActionType.signout):
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
}

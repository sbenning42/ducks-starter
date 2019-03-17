import { SchemaBGL, hasCorrelationTypes, hasCorrelationIds } from '../../beagle/classes/beagle';
import { BoneBGL } from '../../beagle/classes/bone-bgl';
import { StorageBone, StorageEntries } from './storage.bone';
import { Injectable } from '@angular/core';
import { BeagleService } from '../../beagle/beagle.service';
import { RawStoreConfigBGL } from '../../beagle/classes/raw-store-config-bgl';
import { ActionConfigBGL } from '../../beagle/classes/action-config-bgl';
import { Effect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, map, filter, take, distinctUntilChanged, skip, tap, withLatestFrom, defaultIfEmpty } from 'rxjs/operators';
import { ActionBGL } from '../../beagle/classes/action-bgl';
import { concat, of, from, EMPTY, throwError } from 'rxjs';
import { ofResolvedType, makeErroredTypeBGL, makeRequestTypeBGL } from '../../beagle/classes/async-actions-factory-bgl';
import { CorrelationBGL } from '../../beagle/classes/correlation-bgl';
import { UserBone } from './user.bone';
import { Router } from '@angular/router';

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
};
export interface AppSchema extends SchemaBGL {
  initializeRequest: [void];
  initializeResponse: [void];
  setReady: [boolean];
  startLoading: [AppLoadingData];
  stopLoading: [void];
  startError: [AppErrorData];
  stopError: [void];
  goto: [{ target: string, data?: any }];
}
export enum AppActionType {
  initializeRequest = '@app/initialize-request',
  initializeResponse = '@app/initialize-response',
  setReady = '@app/set-ready',
  startLoading = '@app/start-loaidng',
  stopLoading = '@app/stop-loading',
  startError = '@app/start-error',
  stopError = '@app/stop-error',
  goto = '@app/go-to',
}
export interface AppInjectors {
  storage: StorageBone;
  user: UserBone;
  router: Router;
}

@Injectable()
export class AppBone extends BoneBGL<AppState, AppSchema, AppInjectors> {
  constructor(beagle: BeagleService, storage: StorageBone, user: UserBone, router: Router) {
    super(
      beagle,
      { storage, user, router },
      beagle.createFeatureStore<AppState, AppSchema>(
        {
          initializeRequest: new ActionConfigBGL(AppActionType.initializeRequest, ['ini']),
          initializeResponse: new ActionConfigBGL(AppActionType.initializeResponse),
          setReady: new ActionConfigBGL(AppActionType.setReady),
          startLoading: new ActionConfigBGL(AppActionType.startLoading),
          stopLoading: new ActionConfigBGL(AppActionType.stopLoading),
          startError: new ActionConfigBGL(AppActionType.startError),
          stopError: new ActionConfigBGL(AppActionType.stopError),
          goto: new ActionConfigBGL(AppActionType.goto),
        },
        new RawStoreConfigBGL(appType, initialAppState, (state, action) => {
          switch (action.type) {
            case AppActionType.setReady:
              return { ...state, ready: action.payload };
            case AppActionType.startLoading:
              return {
                ...state,
                loading: true,
                loadingCountRef: state.loadingCountRef + 1,
                loadingData: [action.payload, ...state.loadingData]
              };
            case AppActionType.stopLoading:
              return {
                ...state,
                loading: state.loadingCountRef > 1,
                loadingCountRef: state.loadingCountRef - 1,
                loadingData: [...state.loadingData.slice(1)]
              };
            case AppActionType.startError:
              return {
                ...state,
                error: true,
                errorCountRef: state.errorCountRef + 1,
                errorData: [action.payload, ...state.errorData]
              };
            case AppActionType.stopError:
              return {
                ...state,
                error: state.errorCountRef > 1,
                errorCountRef: state.errorCountRef - 1,
                errorData: [...state.errorData.slice(1)]
              };
            case AppActionType.goto:
            default:
              return state;
          }
        })
      )
    );
  }

  @Effect({ dispatch: false })
  private goto$ = this.beagle.actions$.pipe(
    ofType(AppActionType.goto),
    map((action: ActionBGL<{ target: string, data: any }>) => action.payload),
    tap(({ target, data }) => {
      this.injectors.router.navigate([target]);
    })
  );

  @Effect({ dispatch: false })
  private load$ = this.selectors.loading.pipe(
    skip(1),
    distinctUntilChanged(),
    withLatestFrom(this.selectors.loadingData),
    tap(([loading, data]) => {
      if (loading) {
        console.log('Loading Start: ', data);
      } else {
        console.log('Loading Stop.');
      }
    })
  );

  @Effect({ dispatch: false })
  private error$ = this.selectors.error.pipe(
    skip(1),
    distinctUntilChanged(),
    withLatestFrom(this.selectors.errorData),
    tap(([error, data]) => {
      if (error) {
        console.log('Error Start: ', data);
      } else {
        console.log('Error Stop.');
      }
    })
  );

  @Effect({ dispatch: true })
  private startError$ = this.beagle.actions$.pipe(
    filter(action => action.type === makeErroredTypeBGL(action.type)),
    map((action: ActionBGL<{ error: AppErrorData }>) => this.actions.startError.create({
      name: action.payload.error.name,
      message: action.payload.error.message,
    })),
  );

  @Effect({ dispatch: true })
  private loadAsync$ = this.beagle.actions$.pipe(
    filter((action: ActionBGL<any>) => action.type === makeRequestTypeBGL(action.type)),
    hasCorrelationTypes('loadasync'),
    hasCorrelationTypes('async'),
    mergeMap((action: ActionBGL<any>) => {
      const asyncId = action.correlations.find(c => c.type === 'async').id;
      const loading = new CorrelationBGL('loading');
      return concat(
        of(this.bone.actions.startLoading.create({ content: null }, [loading])),
        this.beagle.actions$.pipe(
          hasCorrelationIds(asyncId),
          take(1),
          map(() => this.bone.actions.stopLoading.create(undefined, [loading]))
        )
      );
    }),
  );

  @Effect({ dispatch: true })
  private ini$ = this.beagle.actions$.pipe(
    ofType(AppActionType.initializeRequest),
    mergeMap((initilaize: ActionBGL<void>) => {
      const ini = initilaize.correlations.find(c => c.type === 'ini');
      const initializeResponse = this.actions.initializeResponse.create(undefined, [ini]);
      const ready = this.actions.setReady.create(true, [ini]);
      const startLoading = this.actions.startLoading.create({ content: 'Initializing app ...' }, [ini]);
      const stopLoading = this.actions.stopLoading.create(undefined, [ini]);
      const getStorageRequest = this.injectors.storage.actions.get.createRequest(undefined, [ini]);
      const getStorageResponse$ = this.asyncResolved(getStorageRequest).pipe(defaultIfEmpty({ payload: {} }));
      const goto = (target: string) => this.actions.goto.create({ target, data: undefined }, [ini]);

      const switchStorageContent = (getStorageResponse: ActionBGL<StorageEntries>) => {
        if (getStorageResponse.payload.firstVisit !== false) {
          return of(goto('/tutorial'));
        }
        if (getStorageResponse.payload.credentials) {
          const signinRequest = this.injectors.user.actions.signin.createRequest(getStorageResponse.payload.credentials, [ini]);
          const signinResponse$ = this.asyncResolved(signinRequest).pipe(defaultIfEmpty({ payload: '/signin' }));
          return concat(
            of(signinRequest),
            signinResponse$.pipe(
              map(signinResponse => goto(typeof(signinResponse.payload) === 'string' ? signinResponse.payload : '/home'))
            ),
          );
        } else {
          return of(goto('/signin'));
        }
      };

      return concat(
        from([startLoading, getStorageRequest]),
        getStorageResponse$.pipe(switchMap(switchStorageContent)),
        from([initializeResponse, stopLoading, ready])
      );
    })
  );
}

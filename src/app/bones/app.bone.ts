import { SchemaBGL, hasCorrelationTypes, hasCorrelationIds } from '../../beagle/classes/beagle';
import { BoneBGL } from '../../beagle/classes/bone-bgl';
import { StorageBone, StorageEntries } from './storage.bone';
import { Injectable } from '@angular/core';
import { BeagleService } from '../../beagle/beagle.service';
import { RawStoreConfigBGL } from '../../beagle/classes/raw-store-config-bgl';
import { ActionConfigBGL } from '../../beagle/classes/action-config-bgl';
import { Effect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, map, filter, take } from 'rxjs/operators';
import { ActionBGL } from '../../beagle/classes/action-bgl';
import { concat, of, from } from 'rxjs';
import { ofResolvedType } from '../../beagle/classes/async-actions-factory-bgl';
import { CorrelationBGL } from '../../beagle/classes/correlation-bgl';

export interface AppLoadingData {
  content: string;
}
export interface AppErrorData {
  name: string;
  message: string;
  stack?: string;
}
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
}
export enum AppActionType {
  initializeRequest = '[App Action Type] Initialize Request',
  initializeResponse = '[App Action Type] Initialize Response',
  setReady = '[App Action Type] Set Ready',
  startLoading = '[App Action Type] Start Loaidng',
  stopLoading = '[App Action Type] Stop Loading',
  startError = '[App Action Type] Start Error',
  stopError = '[App Action Type] Stop Error'
}
export interface AppInjectors {
  storage: StorageBone;
}

@Injectable()
export class AppBone extends BoneBGL<AppState, AppSchema, AppInjectors> {
  constructor(beagle: BeagleService, storage: StorageBone) {
    super(
      beagle,
      { storage },
      beagle.createFeatureStore<AppState, AppSchema>(
        {
          initializeRequest: new ActionConfigBGL(AppActionType.initializeRequest, [
            'ini'
          ]),
          initializeResponse: new ActionConfigBGL(AppActionType.initializeResponse),
          setReady: new ActionConfigBGL(AppActionType.setReady),
          startLoading: new ActionConfigBGL(AppActionType.startLoading),
          stopLoading: new ActionConfigBGL(AppActionType.stopLoading),
          startError: new ActionConfigBGL(AppActionType.startError),
          stopError: new ActionConfigBGL(AppActionType.stopError)
        },
        new RawStoreConfigBGL('app', initialAppState, (state, action) => {
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
            default:
              return state;
          }
        })
      )
    );
  }

  @Effect({ dispatch: true })
  loadAsync$ = this.beagle.actions$.pipe(
    filter((action: ActionBGL<any>) => action.type.includes('@ Request')),
    hasCorrelationTypes('loadasync', 'async'),
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
  ini$ = this.beagle.actions$.pipe(
    ofType(AppActionType.initializeRequest),
    mergeMap((initilaize: ActionBGL<void>) => {
      const ini = initilaize.correlations.find(c => c.type === 'ini');
      const initializeResponse = this.actions.initializeResponse.create(undefined, [ini]);
      const ready = this.actions.setReady.create(true, [ini]);
      const startLoading = this.actions.startLoading.create({ content: 'Initializing app ...' }, [ini]);
      const stopLoading = this.actions.stopLoading.create(undefined, [ini]);
      const getStorageRequest = this.injectors.storage.actions.get.createRequest(undefined, [ini]);
      const getStorageResponse$ = this.asyncResolved(getStorageRequest);
      const switchFirstVisit = (getStorageResponse: ActionBGL<StorageEntries>) => {
        if (getStorageResponse.payload.firstVisit === false) {
          return of(initializeResponse);
        }
        const saveStorageRequest = this.injectors.storage.actions.save.createRequest({ firstVisit: false }, [ini]);
        const saveStorageResponse$ = this.asyncResolved(saveStorageRequest);
        return concat(
          of(saveStorageRequest),
          saveStorageResponse$.pipe(map(() => initializeResponse))
        );
      };
      return concat(
        from([startLoading, getStorageRequest]),
        getStorageResponse$.pipe(switchMap(switchFirstVisit)),
        from([stopLoading, ready])
      );
    })
  );
}

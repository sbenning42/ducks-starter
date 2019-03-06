import { Injectable } from '@angular/core';
import { Duck, BaseSchema, responseOf, Ducks } from '../ducks';
import { of } from 'rxjs';

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
  error: boolean;
  loadingRefCount: number;
  errorRefCount: number;
  loadingData: AppLoadingData[];
  errorData: AppErrorData[];
}

export interface AppSelector {
  app: 'app';
}

export interface AppSchema extends BaseSchema {
  initialize: { payload: void, result: void };
  setReady: { payload: { ready: boolean } };
  startLoading: { payload: { loadingData?: AppLoadingData } };
  stopLoading: { payload: void };
  startError: { payload: { errorData?: AppErrorData } };
  stopError: { payload: void };
}

@Injectable()
export class AppDuck extends Duck<AppState, AppSelector, AppSchema> {
  constructor(ducks: Ducks) {
    super({
      selector: 'app',
      state: {
        ready: false,
        loading: false,
        error: false,
        loadingRefCount: 0,
        errorRefCount: 0,
        loadingData: [],
        errorData: [],
      },
      schema: {
        initialize: {
          duckTracking: true,
          isAsync: true,
          reduce: (type: string, state: AppState) => {
            switch (type) {
              case responseOf('initialize'):
                return { ...state, ready: true };
              default:
                return state;
            }
          },
          async: (app: AppDuck) => () => of(null),
        },
        setReady: {
          duckTracking: true,
          isAsync: false,
          reduce: (type: string, state: AppState, payload: { ready: boolean }) => ({
            ...state,
            ready: payload.ready
          })
        },
        startLoading: {
          duckTracking: true,
          isAsync: false,
          reduce: (type: string, state: AppState, payload: { loadingData: AppLoadingData }) => ({
            ...state,
          })
        },
        stopLoading: {
          duckTracking: true,
          isAsync: false,
          reduce: (type: string, state: AppState) => ({
            ...state,
          })
        },
        startError: {
          duckTracking: true,
          isAsync: false,
          reduce: (type: string, state: AppState, payload: { errorData: AppErrorData }) => ({
            ...state,
          })
        },
        stopError: {
          duckTracking: true,
          isAsync: false,
          reduce: (type: string, state: AppState) => ({
            ...state,
          })
        },
      },
    });
    // ducks.registerDuck(this);
  }
}

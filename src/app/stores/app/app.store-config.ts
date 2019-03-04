import { BaseStoreConfig } from 'src/maestro/factories/base-store-m';
import { ActionM } from 'src/maestro/interfaces/action-m';
import { timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { MaestroFacade } from 'src/maestro/store/maestro.facade';
import { select } from '@ngrx/store';
import { selectAllActionsMaestro } from 'src/maestro/store/maestro.store';
import { map, skip, distinctUntilKeyChanged, tap } from 'rxjs/operators';
import { ActionStateM } from 'src/maestro/interfaces/action-state-m';
import { responseType } from 'src/maestro/factories/base-types';

export interface AppState {
  ready: boolean;
  loading: boolean;
  loadingRefCount: number;
  loadingData: any;
  error: Error;
  errorRefCount: number;
}
export enum APP_ACTION_TYPE {
  INITIALIZE = '[APP ACTION TYPE] INITIALIZE',
  START_LOADING = '[APP ACTION TYPE] START_LOADING',
  STOP_LOADING = '[APP ACTION TYPE] STOP_LOADING',
  SET_ERROR = '[APP ACTION TYPE] SET_ERROR',
  CLEAR_ERROR = '[APP ACTION TYPE] CLEAR_ERROR',
}

@Injectable()
export class AppStoreConfig implements BaseStoreConfig<AppState> {
  selector = 'app';
  initial = {
    ready: false,
    loading: false,
    loadingRefCount: 0,
    loadingData: null,
    error: null,
    errorRefCount: 0,
  };
  actionDefinitions = [
    { name: 'startLoading', type: APP_ACTION_TYPE.START_LOADING, isAsync: false },
    { name: 'stopLoading', type: APP_ACTION_TYPE.STOP_LOADING, isAsync: false },
    { name: 'setError', type: APP_ACTION_TYPE.SET_ERROR, isAsync: false },
    { name: 'clearError', type: APP_ACTION_TYPE.CLEAR_ERROR, isAsync: false },
    {
      name: 'initialize',
      type: APP_ACTION_TYPE.INITIALIZE,
      isAsync: true,
      loading: true,
      loadingData: { message: 'Initializing App ...' },
      sideEffect: () => timer(2500),
    }
  ];
  effects = [
    {
      config: { dispatch: true, name: 'loadingEffect$' },
      source$: this.maestro.store.pipe(
        select(selectAllActionsMaestro),
        map((actionStates: ActionStateM[]) => {
          const loadingAction = actionStates.find((actionState: ActionStateM) => actionState.loading === true);
          const loading = !!loadingAction;
          const loadingData = loading ? loadingAction.loadingData : null;
          return { loading, loadingData };
        }),
        skip(1),
        distinctUntilKeyChanged('loading'),
        map(({ loading, loadingData }: { loading: boolean, loadingData: any }) => {
          const app = this.maestro.getStore('app');
          return loading ? app.startLoadingFactory({ loadingData }) : app.stopLoadingFactory();
        }),
      ),
    },
    {
      config: { dispatch: true, name: 'errorEffect$' },
      source$: this.maestro.store.pipe(
        select(selectAllActionsMaestro),
        map((actionStates: ActionStateM[]) => {
          const errorAction = actionStates.find((actionState: ActionStateM) => !!actionState.error);
          const hasError = !!errorAction;
          const error = hasError ? errorAction.error : null;
          return { hasError, error };
        }),
        distinctUntilKeyChanged('hasError'),
        skip(1),
        map(({ hasError, error }: { hasError: boolean, error: Error }) => {
          const app = this.maestro.getStore('app');
          return hasError ? app.setErrorFactory({ error }) : app.clearErrorFactory();
        }),
      ),
    }
  ];
  reducer = (state: AppState, action: ActionM): AppState => {
    switch (action.type) {
      case responseType(APP_ACTION_TYPE.INITIALIZE):
        return { ...state, ready: true };
      case APP_ACTION_TYPE.START_LOADING:
        return {
          ...state,
          loadingRefCount: state.loadingRefCount + 1,
          loadingData: action.payload.loadingData,
          loading: true,
        };
      case APP_ACTION_TYPE.STOP_LOADING:
        return {
          ...state,
          loadingRefCount: state.loadingRefCount - 1,
          loadingData: state.loadingRefCount === 1 ? null : state.loadingData,
          loading: state.loadingRefCount !== 1,
        };
      case APP_ACTION_TYPE.SET_ERROR:
        return {
          ...state,
          errorRefCount: state.errorRefCount + 1,
          error: action.payload.error,
        };
      case APP_ACTION_TYPE.CLEAR_ERROR:
        return {
          ...state,
          errorRefCount: state.errorRefCount - 1,
          error: state.errorRefCount === 1 ? null : state.error,
        };
      case APP_ACTION_TYPE.INITIALIZE:
      default:
        return state;
    }
  }
  constructor(public maestro: MaestroFacade) {}
}

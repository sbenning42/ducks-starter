import { BaseAsyncActionM } from 'src/maestro/abstracts/base-async-action-m';
import { BaseActionM } from 'src/maestro/abstracts/base-action-m';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store, createSelector, select } from '@ngrx/store';
import { Observable, timer } from 'rxjs';
import { selectAllActionsMaestro } from 'src/maestro/store/maestro.store';
import { map, skip, distinctUntilKeyChanged } from 'rxjs/operators';
import { ActionStateM } from 'src/maestro/interfaces/action-state-m';
import { MaestroFacade } from 'src/maestro/store/maestro.facade';

export const appStateSelector = 'app';

export interface AppState {
  ready: boolean;
  loading: boolean;
  loadingRefCount: number;
  loadingData: any;
  error: Error;
  errorRefCount: number;
}

export const initialAppState: AppState = {
  ready: false,
  loading: false,
  loadingRefCount: 0,
  loadingData: null,
  error: null,
  errorRefCount: 0,
};

export enum APP_ACTION_TYPE {
  INITIALIZE = '[APP ACTION TYPE] INITIALIZE',
  START_LOADING = '[APP ACTION TYPE] START_LOADING',
  STOP_LOADING = '[APP ACTION TYPE] STOP_LOADING',
  SET_ERROR = '[APP ACTION TYPE] SET_ERROR',
  CLEAR_ERROR = '[APP ACTION TYPE] CLEAR_ERROR',
}

export class InitializeApp extends BaseAsyncActionM<void> {
  type = APP_ACTION_TYPE.INITIALIZE;
  constructor() {
    super(undefined, undefined, true, { message: 'Initializing App' });
  }
}

export class StartLoadingApp extends BaseActionM<{ loadingData: any }> {
  type = APP_ACTION_TYPE.START_LOADING;
  constructor(public payload: { loadingData: any }) {
    super(payload);
  }
}

export class StopLoadingApp extends BaseActionM<void> {
  type = APP_ACTION_TYPE.STOP_LOADING;
}

export class SetErrorApp extends BaseActionM<{ error: Error }> {
  type = APP_ACTION_TYPE.SET_ERROR;
  constructor(public payload: { error: Error }) {
    super(payload);
  }
}

export class ClearErrorApp extends BaseActionM<void> {
  type = APP_ACTION_TYPE.CLEAR_ERROR;
}

export type AppActions = InitializeApp
  | StartLoadingApp
  | StopLoadingApp
  | SetErrorApp
  | ClearErrorApp;

export function appStateReducer(state: AppState = initialAppState, action: AppActions): AppState {
  switch (action.type) {

    case `${APP_ACTION_TYPE.INITIALIZE} @RESPONSE`: {
      const payload = (action as StartLoadingApp).payload;
      return {
        ...state,
        ready: true,
      };
    }

    case APP_ACTION_TYPE.START_LOADING: {
      const payload = (action as StartLoadingApp).payload;
      return {
        ...state,
        loadingRefCount: state.loadingRefCount + 1,
        loadingData: payload.loadingData,
        loading: true,
      };
    }

    case APP_ACTION_TYPE.STOP_LOADING: {
      const payload = (action as StopLoadingApp).payload;
      return {
        ...state,
        loadingRefCount: state.loadingRefCount - 1,
        loadingData: state.loadingRefCount === 1 ? null : state.loadingData,
        loading: state.loadingRefCount !== 1,
      };
    }

    case APP_ACTION_TYPE.SET_ERROR: {
      const payload = (action as SetErrorApp).payload;
      return {
        ...state,
        errorRefCount: state.errorRefCount + 1,
        error: payload.error,
      };
    }

    case APP_ACTION_TYPE.CLEAR_ERROR: {
      const payload = (action as ClearErrorApp).payload;
      return {
        ...state,
        errorRefCount: state.errorRefCount - 1,
        error: state.errorRefCount === 1 ? null : state.error,
      };
    }

    case APP_ACTION_TYPE.INITIALIZE:
    default:
      return state;
  }
}

const selectAppState = (states: any) => states[appStateSelector] as AppState;
const selectReadyApp = createSelector(selectAppState, (state: AppState) => state.ready);
const selectLoadingApp = createSelector(selectAppState, (state: AppState) => state.loading);
const selectLoadingRefCountApp = createSelector(selectAppState, (state: AppState) => state.loadingRefCount);
const selectLoadingDataApp = createSelector(selectAppState, (state: AppState) => state.loadingData);
const selectErrorApp = createSelector(selectAppState, (state: AppState) => state.error);
const selectErrorRefCountApp = createSelector(selectAppState, (state: AppState) => state.errorRefCount);

@Injectable()
export class AppEffect {
  constructor(
    public action$: Actions,
    public store: Store<any>
  ) { }
  @Effect()
  loading$ = this.store.pipe(
    select(selectAllActionsMaestro),
    map((actionStates: ActionStateM[]) => {
      const loadingAction = actionStates.find((actionState: ActionStateM) => actionState.loading === true);
      const loading = !!loadingAction;
      const loadingData = loading ? loadingAction.loadingData : null;
      return { loading, loadingData };
    }),
    skip(1),
    distinctUntilKeyChanged('loading'),
    map(({ loading, loadingData }: { loading: boolean, loadingData: any }) => loading
      ? new StartLoadingApp({ loadingData })
      : new StopLoadingApp()
    ),
  );
  @Effect()
  error$ = this.store.pipe(
    select(selectAllActionsMaestro),
    map((actionStates: ActionStateM[]) => {
      const errorAction = actionStates.find((actionState: ActionStateM) => !!actionState.error);
      const hasError = !!errorAction;
      const error = hasError ? errorAction.error : null;
      return { hasError, error };
    }),
    distinctUntilKeyChanged('hasError'),
    skip(1),
    map(({ hasError, error }: { hasError: boolean, error: Error }) => hasError
      ? new SetErrorApp({ error })
      : new ClearErrorApp()
    ),
  );
}

@Injectable()
export class AppFacade {

  app$: Observable<AppState> = this.store.pipe(select(selectAppState));
  ready$: Observable<boolean> = this.store.pipe(select(selectReadyApp));
  loading$: Observable<boolean> = this.store.pipe(select(selectLoadingApp));
  loadingRefCount$: Observable<number> = this.store.pipe(select(selectLoadingRefCountApp));
  loadingData$: Observable<any> = this.store.pipe(select(selectLoadingDataApp));
  error$: Observable<Error> = this.store.pipe(select(selectErrorApp));
  errorRefCount$: Observable<number> = this.store.pipe(select(selectErrorRefCountApp));

  constructor(
    private store: Store<any>,
    private maestro: MaestroFacade,
  ) {
    this.maestro.registerSideEffect<void, number>(APP_ACTION_TYPE.INITIALIZE, () => timer(2500));
  }

  initialize() {
    this.store.dispatch(new InitializeApp());
  }

  startLoading(loadingData: any) {
    this.store.dispatch(new StartLoadingApp({ loadingData }));
  }

  stopLoading() {
    this.store.dispatch(new StopLoadingApp());
  }

  setError(error: Error) {
    this.store.dispatch(new SetErrorApp({ error }));
  }

  clearError() {
    this.store.dispatch(new ClearErrorApp());
  }
}


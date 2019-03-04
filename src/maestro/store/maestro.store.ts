import {
  EntityState,
  createEntityAdapter,
  EntityAdapter,
  Update,
} from '@ngrx/entity';
import { ofType } from '@ngrx/effects';
import { ActionStateM } from '../interfaces/action-state-m';
import { createSelector } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ActionM } from '../interfaces/action-m';

export const maestroStateSelector = 'maestro';

export interface MaestroState {
  actions: EntityState<ActionStateM>;
}

export const actionsMaestroAdapter: EntityAdapter<ActionStateM> = createEntityAdapter<ActionStateM>({ sortComparer: false });

export const initialMaestroState: MaestroState = {
  actions: actionsMaestroAdapter.getInitialState(),
};

export enum MAESTRO_ACTION_TYPE {
  ADD = '[MAESTRO ACTION TYPE] ADD',
  UPDATE = '[MAESTRO ACTION TYPE] UPDATE',
  REMOVE = '[MAESTRO ACTION TYPE] REMOVE',
  CLEAR = '[MAESTRO ACTION TYPE] CLEAR',
}

export class AddMaestroAction {
  type = MAESTRO_ACTION_TYPE.ADD;
  constructor(public payload: { state: ActionStateM }) {}
}

export class UpdateMaestroAction {
  type = MAESTRO_ACTION_TYPE.UPDATE;
  constructor(public payload: { update: Update<ActionStateM> }) {}
}

export class RemoveMaestroAction {
  type = MAESTRO_ACTION_TYPE.REMOVE;
  constructor(public payload: { id: string }) {}
}

export class ClearMaestro {
  type = MAESTRO_ACTION_TYPE.CLEAR;
}

export type MaestroActions = AddMaestroAction
  | UpdateMaestroAction
  | RemoveMaestroAction
  | ClearMaestro;

export function maestroStateReducer(state: MaestroState = initialMaestroState, action: MaestroActions): MaestroState {
  switch (action.type) {

    case MAESTRO_ACTION_TYPE.ADD: {
      const payload = (action as AddMaestroAction).payload;
      return {
        ...state,
        actions: actionsMaestroAdapter.addOne(payload.state, state.actions),
      };
    }

    case MAESTRO_ACTION_TYPE.UPDATE: {
      const payload = (action as UpdateMaestroAction).payload;
      return {
        ...state,
        actions: actionsMaestroAdapter.updateOne(payload.update, state.actions),
      };
    }

    case MAESTRO_ACTION_TYPE.REMOVE: {
      const payload = (action as RemoveMaestroAction).payload;
      return {
        ...state,
        actions: actionsMaestroAdapter.removeOne(payload.id, state.actions),
      };
    }

    case MAESTRO_ACTION_TYPE.CLEAR: {
      return {
        ...state,
        actions: actionsMaestroAdapter.removeAll(state.actions),
      };
    }

    default:
      return state;

  }
}

export const selectMaestro = (states: any) => states[maestroStateSelector] as MaestroState;
export const selectActionsMaestro = createSelector(selectMaestro, (state: MaestroState) => state.actions);
export const {
  selectAll: _selectAllActionsMaestro,
  selectEntities: _selectEntitiesActionsMaestro,
  selectIds: _selectIdsActionsMaestro,
  selectTotal: _selectTotalActionsMaestro
} = actionsMaestroAdapter.getSelectors();
export const selectAllActionsMaestro = createSelector(selectActionsMaestro, _selectAllActionsMaestro);
export const selectEntitiesActionsMaestro = createSelector(selectActionsMaestro, _selectEntitiesActionsMaestro);
export const selectIdsActionsMaestro = createSelector(selectActionsMaestro, _selectIdsActionsMaestro);
export const selectTotalActionsMaestro = createSelector(selectActionsMaestro, _selectTotalActionsMaestro);

export const asynced = (type: string, id: string) => (actions$: Observable<ActionM>) => actions$.pipe(
  ofType(type),
  filter((action: ActionM) => action.asyncId === id)
);
export const correlated = (type: string, id: string) => (actions$: Observable<ActionM>) => actions$.pipe(
  ofType(type),
  filter((action: ActionM) => action.correlationId === id)
);


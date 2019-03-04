import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { MaestroFacade } from './maestro.facade';
import { Effect } from '@ngrx/effects';
import { filter, mergeMap, take, map, catchError, distinctUntilChanged, concatMap, tap } from 'rxjs/operators';
import { of, from, concat, defer, empty, EMPTY } from 'rxjs';
import { ActionM } from '../interfaces/action-m';
import { UpdateMaestroAction, AddMaestroAction, RemoveMaestroAction } from './maestro.store';
import { STATUS_ACTION_STATE_M } from '../enums/status-action-state-m';
import { actionStateMFactory } from '../factories/action-state-m';
import { ActionStateM } from '../interfaces/action-state-m';
import { BaseRequestActionM } from '../models/base-request-action-m';
import { BaseResponseActionM } from '../models/base-response-action-m';
import { BaseErrorActionM } from '../models/base-error-action-m';

@Injectable()
export class MaestroEffects {

  constructor(
    public actions$: Actions,
    public maestro: MaestroFacade
  ) { }

  @Effect()
  add$ = this.actions$.pipe(
    filter((action: ActionM) => action.isAsync === true),
    concatMap((action: ActionM) => concat(
      of(new AddMaestroAction({ state: actionStateMFactory(action) })),
      this.maestro.hasSideEffect(action.type)
        ? concat(
          from([
            new BaseRequestActionM(action),
            new UpdateMaestroAction({
              update: {
                id: action.id,
                changes: {
                  status: STATUS_ACTION_STATE_M.PENDING,
                }
              }
            })
          ]),
          this.maestro.sideEffect(action.type)(action.payload, this.actions$, this.maestro.store).pipe(
            take(1),
            concatMap((result: any) => [
              new UpdateMaestroAction({
                update: {
                  id: action.id,
                  changes: {
                    loading: false,
                    status: STATUS_ACTION_STATE_M.RESOLVED,
                    result,
                  }
                }
              }),
              new BaseResponseActionM(result, action),
            ]),
            catchError((error: Error) => from([
              new UpdateMaestroAction({
                update: {
                  id: action.id,
                  changes: {
                    loading: false,
                    status: STATUS_ACTION_STATE_M.ERRORED,
                    error,
                  }
                }
              }),
              new BaseErrorActionM({ error }, action),
            ]))
          )
        ) : EMPTY
    )),
  );

  @Effect({ dispatch: true })
  removeFinished$ = defer(() => {
    const alreadyRemoved: { [id: string]: boolean } = {};
    return this.maestro.allActions$.pipe(
      filter((actionStates: ActionStateM[]) => !!actionStates),
      distinctUntilChanged(),
      map((actionStates: ActionStateM[]) => {
        const notAlreadyFinish = (actionState: ActionStateM) => alreadyRemoved[actionState.id] === undefined;
        const isFinish = (actionState: ActionStateM) => actionState.status === STATUS_ACTION_STATE_M.RESOLVED
          || actionState.status === STATUS_ACTION_STATE_M.ERRORED
          || actionState.status === STATUS_ACTION_STATE_M.CANCELED;
        const pluckId = (actionState: ActionStateM) => actionState.id;
        return actionStates
          .filter(notAlreadyFinish)
          .filter(isFinish)
          .map(pluckId);
      }),
      tap((actionStateIds: string[]) => actionStateIds.forEach((id: string) => alreadyRemoved[id] = true)),
      filter((actionStateIds: string[]) => actionStateIds.length > 0),
      concatMap((actionStateIds: string[]) => actionStateIds.map((id: string) => new RemoveMaestroAction({ id }))),
    );
  });
}

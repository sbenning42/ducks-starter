import { Injectable } from '@angular/core';
import { UTFluxDecoratedTask, ITFluxDecoratedTask } from '../interfaces/t-flux-decorated-task';
import { Actions, Effect } from '@ngrx/effects';
import { filter, tap, concatMap, map, catchError, takeUntil, defaultIfEmpty, first, mergeMap } from 'rxjs/operators';
import { FluxAction } from '../interfaces/flux-action';
import { of, concat, Observable, defer } from 'rxjs';
import { Store } from '@ngrx/store';
import { FluxSyncTask, FluxAsyncTask } from '../decorators/flux-task';
import { IFluxDecoredSyncTask } from '../interfaces/i-flux-decored-sync-task';
import { IFluxDecoredAsyncTask } from '../interfaces/i-flux-decored-async-task';

export enum FluxTK {
  serial = '{ Flux Serial }',
  parallel = '[ Flux Parallel ]',
  command = 'Flux Command',
  event = 'Flux Event',
  request = 'Request',
  cancel = 'Cancel',
  resolved = 'Resolved',
  errored = 'Errored',
  canceled = 'Canceled',
}

export function fluxRequest(type: string): string {
  return `${type}@${FluxTK.command}@${FluxTK.request}`;
}
export function fluxCancel(type: string): string {
  return `${type}@${FluxTK.command}@${FluxTK.cancel}`;
}
export function fluxResolved(type: string): string {
  return `${type}@${FluxTK.event}@${FluxTK.resolved}`;
}
export function fluxErrored(type: string): string {
  return `${type}@${FluxTK.event}@${FluxTK.errored}`;
}
export function fluxCanceled(type: string): string {
  return `${type}@${FluxTK.event}@${FluxTK.canceled}`;
}
export function withCommandStatus(type: string): boolean {
  return type.includes(FluxTK.command);
}
export function withEventStatus(type: string): boolean {
  return type.includes(FluxTK.event);
}
export function withResolvedStatus(type: string): boolean {
  return type.includes(FluxTK.event) && type.includes(FluxTK.resolved);
}
export function withErroredStatus(type: string): boolean {
  return type.includes(FluxTK.event) && type.includes(FluxTK.errored);
}
export function withCanceledStatus(type: string): boolean {
  return type.includes(FluxTK.event) && type.includes(FluxTK.canceled);
}
export function withRequestStatus(type: string): boolean {
  return type.includes(FluxTK.command) && type.includes(FluxTK.request);
}
export function withCancelStatus(type: string): boolean {
  return type.includes(FluxTK.command) && type.includes(FluxTK.cancel);
}
export function extractOriginal(type: string): string {
  const parts = type.split('@') as FluxTK[];
  return parts.length === 3 ? parts[0] : null;
}
export function extractTypeTK(type: string): FluxTK {
  const parts = type.split('@') as FluxTK[];
  return parts.length === 3 ? parts[1] : null;
}
export function extractValueTK(type: string): FluxTK {
  const parts = type.split('@') as FluxTK[];
  return parts.length === 3 ? parts[2] : null;
}
export function extractTK(type: string): { original: string, type: FluxTK, value: FluxTK } {
  const parts = type.split('@') as FluxTK[];
  return parts.length === 3 ? { original: parts[0], type: parts[1], value: parts[2] } : null;
}

@Injectable()
export class FluxService {

  private tasksArray: ITFluxDecoratedTask<any, any>[] = [];
  private taskTypes: string[] = [];
  private tasks: { [type: string]: ITFluxDecoratedTask<any, any> } = {};

  constructor(public store: Store<any>, public actions$: Actions) { }

  @Effect({ dispatch: false })
  private execSync$ = this.actions$.pipe(
    filter((action: FluxAction) => !!action.config && action.config.fluxTracking && !action.config.isAsync),
    // tap((action: FluxAction) => console.log(`Flux handling sync: ${action.type}`)),
    tap((action: FluxAction) => this.getTask(action.type).sync(action.payload)),
  );

  @Effect({ dispatch: true })
  private execAsync$ = this.actions$.pipe(
    filter((action: FluxAction) => !!action.config && action.config.fluxTracking && action.config.isAsync),
    // tap((action: FluxAction) => console.log(`Flux handling async: ${action.type}`)),
    mergeMap((action: FluxAction) => concat(
      of({ ...action, type: fluxRequest(action.type), config: { ...action.config, fluxTracking: false } }),
      this.getTask(action.type).async(action.payload).pipe(
        map((result: any) => ({
          ...action,
          type: fluxResolved(action.type),
          config: {
            ...action.config,
            fluxTracking: false,
          },
          payload: { _payload: action.payload, ...result },
        })),
        catchError((error: Error) => {
          return of({
            ...action,
            type: fluxErrored(action.type),
            config: {
              ...action.config,
              fluxTracking: false,
            },
            payload: { _payload: action.payload, error }
          });
        }),
        takeUntil(this.taskFinish(action.id, withCancelStatus)),
        defaultIfEmpty({
          ...action,
          type: fluxCanceled(action.type),
          config: {
            ...action.config,
            fluxTracking: false,
          },
          payload: { _payload: action.payload },
        })
      )
    )),
  );

  registerTasks(...tasks: UTFluxDecoratedTask<any, any>[]) {
    tasks.forEach(task => {
      task.config.fluxTracking = task.config.fluxTracking !== undefined ? task.config.fluxTracking : true;
      task.dispatch = (payload: any) => {
        const action = task.factory(payload);
        this.store.dispatch(action);
        return action;
      };
      this.tasksArray.push(task as ITFluxDecoratedTask<any, any>);
      this.taskTypes.push(task.config.type);
      this.tasks[task.config.type] = task as ITFluxDecoratedTask<any, any>;
    });
  }

  getTask<P = any, R = any>(type: string): ITFluxDecoratedTask<P, R> {
    return this.tasks[type];
  }

  taskFinish(id: string, withStatus: (type: string) => boolean): Observable<FluxAction> {
    return this.actions$.pipe(
      filter((action: FluxAction) => action.id === id && withStatus(action.type)),
      first(),
    );
  }

  cancel(type: string, id: string) {
    this.store.dispatch({ id, type: fluxCancel(type) });
  }

  dispatch(action: FluxAction) {
    this.store.dispatch(action);
  }

  serial<SP = any, SR = any, NP = any, NR = any>(
    _sourceTask: UTFluxDecoratedTask<SP, SR>,
    _nextTask: UTFluxDecoratedTask<NP, NR>
  ): UTFluxDecoratedTask<SP & NP | SP, SR & NR> {
    const sourceTask = _sourceTask as ITFluxDecoratedTask<SP, SR>;
    const nextTask = _nextTask as ITFluxDecoratedTask<NP, NR>;
    const serialType = `${FluxTK.serial} ${sourceTask.config.type} => ${nextTask.config.type}`;
    type ITFluxSerialPayload = SP & NP;
    type ITFluxSerialResult = SR & NR;
    if (!sourceTask.config.isAsync && !nextTask.config.isAsync) {
      @FluxSyncTask<ITFluxSerialPayload>({ type: serialType })
      class FluxAnonymousSerialSyncSyncTask {
        sync(payload: ITFluxSerialPayload) {
          sourceTask.sync(payload);
          nextTask.sync(payload);
        }
      }
      return new FluxAnonymousSerialSyncSyncTask as IFluxDecoredSyncTask<ITFluxSerialPayload>;
    } else if (!sourceTask.config.isAsync && nextTask.config.isAsync) {
      @FluxAsyncTask<ITFluxSerialPayload, ITFluxSerialResult>({ type: serialType })
      class FluxAnonymousSerialSyncAsyncTask {
        async(payload: ITFluxSerialPayload): Observable<ITFluxSerialResult> {
          return concat(
            defer(() => sourceTask.sync(payload)),
            nextTask.async(payload),
          ) as Observable<ITFluxSerialResult>;
        }
      }
      return new FluxAnonymousSerialSyncAsyncTask as IFluxDecoredAsyncTask<ITFluxSerialPayload, ITFluxSerialResult>;
    } else if (sourceTask.config.isAsync && !nextTask.config.isAsync) {
      @FluxAsyncTask<SP, ITFluxSerialResult>({ type: serialType })
      class FluxAnonymousSerialAsyncSyncTask {
        async(payload: SP): Observable<ITFluxSerialResult> {
          return sourceTask.async(payload).pipe(
            map((result: SR) => {
              nextTask.sync({ ...payload, ...result } as any as NP);
              return result as any as ITFluxSerialResult;
            })
          );
        }
      }
      return new FluxAnonymousSerialAsyncSyncTask as IFluxDecoredAsyncTask<SP, ITFluxSerialResult>;
    } else if (sourceTask.config.isAsync && nextTask.config.isAsync) {
      @FluxAsyncTask<SP, ITFluxSerialResult>({ type: serialType })
      class FluxAnonymousSerialAsyncAsyncTask {
        async(payload: SP): Observable<ITFluxSerialResult> {
          return sourceTask.async(payload).pipe(
            concatMap((result: SR) => {
              return nextTask.async({ ...payload, ...result } as any as NP).pipe(
                map((nextResult: NR) => ({ ...result, ...nextResult })),
              );
            })
          );
        }
      }
      return new FluxAnonymousSerialAsyncAsyncTask as IFluxDecoredAsyncTask<SP, ITFluxSerialResult>;
    }
  }
  parallel<
    PS extends Array<any> = any[],
    RS extends Array<any> = any[],
    KP extends keyof PS = keyof PS,
    KR extends keyof RS = keyof RS
  >(tasks: Array<UTFluxDecoratedTask<PS[KP], RS[KR]>>) {
  }

}

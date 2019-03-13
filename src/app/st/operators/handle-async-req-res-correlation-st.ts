import { Observable, of, EMPTY, defer, concat } from 'rxjs';
import { isST } from './is-st';
import { initialCorrelatedTo } from './initial-correlated-to-st';
import { AsyncReqResCorrelationController } from '../classes/async-req-res-correlation-controller-st';
import { mergeMap, take, map, catchError, takeUntil, defaultIfEmpty, filter, tap } from 'rxjs/operators';
import { ActionST } from '../interfaces/action-st';
import { ActionFactoryST } from '../classes/action-factory-st';
import { ActionHeaderCorrelatedFactoryST } from '../classes/action-header-correlated-factory-st';
import { allCorrelatedST } from './all-correlated-st';
import { ActionCorrelationST } from '../interfaces/action-correlation-st';
import { ofType } from '@ngrx/effects';

export function asyncRequestOfST(type: string) {
  return `${type} @ [Async Request Response] Request`;
}
export function asyncCancelOfST(type: string) {
  return `${type} @ [Async Request Response] Cancel`;
}
export function asyncResolvedOfST(type: string) {
  return `${type} @ [Async Request Response] Resolved`;
}
export function asyncErroredOfST(type: string) {
  return `${type} @ [Async Request Response] Errored`;
}
export function asyncCanceledOfST(type: string) {
  return `${type} @ [Async Request Response] Canceled`;
}

export class AsyncResolvedActionFactoryST<T> extends ActionFactoryST<T> {
  constructor(request: ActionST<any>, response: T) {
    super({
      header: new ActionHeaderCorrelatedFactoryST({
        type: asyncResolvedOfST(request.type),
        correlationTypes: [AsyncReqResCorrelationController.type],
        header: request.header ? request.header : request as any
      }),
      payload: response
    });
    this.header.correlations[0].final = true;
  }
}

export class AsyncErroredActionFactoryST extends ActionFactoryST<{ error: Error }> {
  constructor(request: ActionST<any>, error: Error) {
    super({
      header: new ActionHeaderCorrelatedFactoryST({
        type: asyncErroredOfST(request.type),
        correlationTypes: [AsyncReqResCorrelationController.type],
        header: request.header ? request.header : request as any
      }),
      payload: { error }
    });
    this.header.correlations[0].final = true;
  }
}

export class AsyncCanceledActionFactoryST extends ActionFactoryST<undefined> {
  constructor(request: ActionST<any>) {
    super({
      header: new ActionHeaderCorrelatedFactoryST({
        type: asyncCanceledOfST(request.type),
        correlationTypes: [AsyncReqResCorrelationController.type],
        header: request.header ? request.header : request as any
      }),
      payload: undefined,
    });
    this.header.correlations[0].final = true;
  }
}

export class AsyncRequestActionFactoryST<T = void> extends ActionFactoryST<T> {
  constructor(action: ActionST<T>) {
    super({
      header: new ActionHeaderCorrelatedFactoryST({
        type: asyncRequestOfST(action.type),
        correlationTypes: [AsyncReqResCorrelationController.type],
        header: action.header ? action.header : action as any
      }),
      payload: action.payload,
    });
  }
}

export class AsyncCancelActionFactoryST extends ActionFactoryST<undefined> {
  constructor(action: ActionST<any>) {
    super({
      header: new ActionHeaderCorrelatedFactoryST({
        type: asyncCancelOfST(action.type),
        correlationTypes: [AsyncReqResCorrelationController.type],
        header: action.header ? action.header : action as any
      }),
      payload: undefined,
    });
  }
}

export function asyncResolvedFactoryST<T = void>(request: ActionST<any>, response: T) {
  return new AsyncResolvedActionFactoryST<T>(request, response);
}

export function asyncErroredFactoryST(request: ActionST<any>, error: Error) {
  return new AsyncErroredActionFactoryST(request, error);
}

export function asyncCanceledFactoryST(request: ActionST<any>) {
  return new AsyncCanceledActionFactoryST(request);
}

export function asyncRequestFactoryST(action: ActionST<any>) {
  return new AsyncRequestActionFactoryST(action);
}

export function asyncCancelFactoryST(action: ActionST<any>) {
  return new AsyncCancelActionFactoryST(action);
}

export function handleAsyncReqResCorrelationST<P = void, R = void>(
  getAsyncResMap: () => { [type: string]: (payload: P) => Observable<R> },
) {
  return (actions$: Observable<any>) => defer(() => {
    const empty = () => EMPTY;
    const resolveType = (type: string) => getAsyncResMap()[type] || empty;
    const asyncReqResCorrelation = (correlation: ActionCorrelationST) => correlation.type === AsyncReqResCorrelationController.type;
    return actions$.pipe(
      // isST(),
      tap(action => console.log('0 here with: ', action)),
      filter((action) => action.type && (action.correlations || (action.header && action.header.correlations))),
      tap(action => console.log('1 here with: ', action)),
      initialCorrelatedTo(AsyncReqResCorrelationController.type),
      tap(action => console.log('2 here with: ', action)),
      mergeMap((action: ActionST<P>) => concat(
        of(asyncRequestFactoryST(action)),
        resolveType(action.type)(action.payload).pipe(
          take(1),
          map((response: R) => asyncResolvedFactoryST(action, response)),
          catchError((error: Error) => of(asyncErroredFactoryST(action, error))),
          takeUntil(actions$.pipe(
            allCorrelatedST((action.header ? action.header : action as any).correlations.find(asyncReqResCorrelation)),
            ofType(asyncCancelOfST(action.type))
          )),
          defaultIfEmpty(asyncCanceledFactoryST(action))
        ),
      ))
    );
  });
}

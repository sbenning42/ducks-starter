import { Injectable } from '@angular/core';
import { DucksManager } from './classes/ducks-manager';
import { Effect, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Action } from './classes/action';
import { filter, mergeMap, map, catchError, defaultIfEmpty, takeUntil, first, tap } from 'rxjs/operators';
import { hasCorrelationType, isRequestType, getCorrelationType, hasCorrelationId, isCancelType } from './tools/async-correlation';
import { SYMBOL } from './enums/symbol';
import { EMPTY, Observable, of } from 'rxjs';
import { AsyncActionHandlerType } from './types/async-action-handler.type';
import { AsyncActionFactory } from './classes/async-action-factory';
import { environment } from 'src/environments/environment';

@Injectable()
export class DucksService extends DucksManager {
    constructor(
        public store: Store<any>,
        public actions$: Actions<Action<any>>
    ) {
        super(store, actions$);
    }

    @Effect({ dispatch: false })
    private logAllActions$ = this.actions$.pipe(
        filter((action: Action<any>) => environment.logAllActions && !action.type.includes('@ngrx')),
        tap((action: Action<any>) => console.log(`DucksService@logAllActions$: ${action.type}`, action)),
    );

    @Effect({ dispatch: true })
    private asyncCorrelation$ = this.actions$.pipe(
        filter(action => hasCorrelationType(action, SYMBOL.ASYNC_CORRELATION)),
        filter(action => isRequestType(action.type)),
        mergeMap((request: Action<any>) => {
            const duck = this.getOf(request.type);
            if (!duck) {
                return EMPTY;
            }
            const factory = duck.getFactory(request.type) as AsyncActionFactory<any>;
            const handler = factory.config.options.handler as (payload: any) => Observable<any>;
            if (!factory) {
                return EMPTY;
            }
            const async = getCorrelationType(request, SYMBOL.ASYNC_CORRELATION);
            return handler(request.payload).pipe(
                map((result: any) => factory.createResolved(result, [async])),
                catchError((error: Error) => of(factory.createErrored({
                    error: {
                        name: error.name,
                        message: error.message,
                        // stack: error.stack
                    }
                }, [async]))),
                takeUntil(this.actions$.pipe(
                    filter(thisAction => hasCorrelationId(thisAction, async.id)),
                    filter(thisAction => isCancelType(thisAction.type)),
                )),
                defaultIfEmpty(factory.createCanceled([async])),
                first(),
            );
        }),
    );
}

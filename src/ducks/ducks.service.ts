import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Actions, Effect } from "@ngrx/effects";
import { ActionD } from "./models/action";
import { DucksManagerD } from "./models/ducks-manager";
import { hasCorrelationTypes, getCorrelationType, isAsyncRequestType, hasCorrelationIds, isAsyncCancelType } from "./tools/async";
import { Observable, of } from "rxjs";
import { mergeMap, filter, map, catchError, defaultIfEmpty, takeUntil, first, tap } from "rxjs/operators";
import { AsyncActionFactoryD } from "./models/async-action-factory";
import { SYMD } from "./enums/sym";
import { SyncActionFactoryD } from "./models/sync-action-factory";

const asyncCorrelation = getCorrelationType(SYMD.ASYNC_CORRELATION);

@Injectable()
export class DucksService {

    manager: DucksManagerD = new DucksManagerD(this.store, this.actions$);

    constructor(
        public store: Store<any>,
        public actions$: Actions<ActionD<any>>,
    ) {}

    @Effect({ dispatch: true })
    private async$ = this.actions$.pipe(
        hasCorrelationTypes(SYMD.ASYNC_CORRELATION),
        filter(request => isAsyncRequestType(request.type)),
        mergeMap(request => {
            const async = asyncCorrelation(request);
            const manager = this.manager.getActionFactoryOf(request) as AsyncActionFactoryD<any>;
            return (manager.config.handler(request.payload) as Observable<any>).pipe(
                map(result => manager.createAsyncResolved(result, [async])),
                catchError(error => of(manager.createAsyncErrored({ error }, [async]))),
                defaultIfEmpty(manager.createAsyncCanceled([async])),
                first(),
                takeUntil(this.actions$.pipe(
                    hasCorrelationIds(async.id),
                    filter(action => isAsyncCancelType(action.type)),
                )),
            );
        })
    );

    @Effect({ dispatch: false })
    private sync$ = this.actions$.pipe(
        map((action: ActionD<any>) => ({ action, factory: this.manager.getActionFactoryOf(action) as SyncActionFactoryD<any> })),
        filter(({ factory }) => !!factory && !factory.config.async && !!factory.config.handler),
        tap(({ action, factory }) => {
           factory.config.handler(action.payload); 
        })
    );
}

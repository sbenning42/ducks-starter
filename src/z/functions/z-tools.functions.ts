import { Z_SYMBOL } from "../enums/z-symbol.enum";
import { Action } from "../classes/action.class";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { ofType } from '@ngrx/store';

export const asRequestType = (type: string) => `${type}/${Z_SYMBOL.Z}/${Z_SYMBOL.TASK}/${Z_SYMBOL.REQUEST}`;
export const asCancelType = (type: string) => `${type}/${Z_SYMBOL.Z}/${Z_SYMBOL.TASK}/${Z_SYMBOL.CANCEL}`;
export const asResolveType = (type: string) => `${type}/${Z_SYMBOL.Z}/${Z_SYMBOL.TASK}/${Z_SYMBOL.RESOLVE}`;
export const asErrorType = (type: string) => `${type}/${Z_SYMBOL.Z}/${Z_SYMBOL.TASK}/${Z_SYMBOL.ERROR}`;
export const asRequestResolveType = (type: string) => `${type}/${Z_SYMBOL.Z}/${Z_SYMBOL.TASK}/${Z_SYMBOL.REQUEST}-${Z_SYMBOL.RESOLVE}`;

export const isZType = (type: string) => type.includes(Z_SYMBOL.Z);
export const isZTaskType = (type: string) => isZType(type) && type.includes(Z_SYMBOL.TASK);
export const isZTaskRequestType = (type: string) => isZTaskType(type) && type.includes(Z_SYMBOL.REQUEST);
export const isZTaskCancelType = (type: string) => isZTaskType(type) && type.includes(Z_SYMBOL.CANCEL);
export const isZTaskResolveType = (type: string) => isZTaskType(type) && type.includes(Z_SYMBOL.RESOLVE);
export const isZTaskErrorType = (type: string) => isZTaskType(type) && type.includes(Z_SYMBOL.ERROR);
export const isZTaskRequestResolveType = (type: string) => isZTaskType(type) && type.includes(Z_SYMBOL.REQUEST) && type.includes(Z_SYMBOL.RESOLVE);

export const grabCorrelationId = (action: Action, id: string) => action.correlations
    && action.correlations.find(correlation => correlation.id === id);

export const grabCorrelationType = (action: Action, type: string) => action.correlations
    && action.correlations.find(correlation => correlation.type === type);

export function hasCorrelationId(id: string) {
    return (actions$: Observable<Action>) => actions$.pipe(
        filter((action: Action) => !!action.correlations
            && action.correlations.some(correlation => correlation.id === id)
        )
    );
}
export function hasCorrelationType(type: string) {
    return (actions$: Observable<Action>) => actions$.pipe(
        filter((action: Action) => !!action.correlations
            && action.correlations.some(correlation => correlation.type === type)
        )
    );
}

export function getTypeWithCorrelationId(type: string, correlationId: string) {
    return (actions$: Observable<Action>) => actions$.pipe(
        ofType(type),
        hasCorrelationId(correlationId),
    );
}

export function getTypeWithCorrelationType(type: string, correlationType: string) {
    return (actions$: Observable<Action>) => actions$.pipe(
        ofType(type),
        hasCorrelationType(correlationType),
    );
}
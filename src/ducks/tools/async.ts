import { SYMD } from "../enums/sym";
import { Actions } from "@ngrx/effects";
import { ActionD } from "../models/action";
import { filter, take } from "rxjs/operators";
import { CorrelationD } from "../models/correlation";

export function getType(rawType: string) {
    return rawType.split(`/${SYMD.DUCKS}`)[0];
}

export function createAsyncRequestType(rawType: string) {
    const type = getType(rawType);
    return `${type}/${SYMD.DUCKS}/${SYMD.ASYNC}/${SYMD.REQUEST}`;
}

export function createAsyncRetryType(rawType: string) {
    const type = getType(rawType);
    return `${type}/${SYMD.DUCKS}/${SYMD.ASYNC}/${SYMD.RETRY}`;
}

export function createAsyncCancelType(rawType: string) {
    const type = getType(rawType);
    return `${type}/${SYMD.DUCKS}/${SYMD.ASYNC}/${SYMD.CANCEL}`;
}

export function createAsyncResolvedType(rawType: string) {
    const type = getType(rawType);
    return `${type}/${SYMD.DUCKS}/${SYMD.ASYNC}/${SYMD.RESOLVED}`;
}

export function createAsyncErroredType(rawType: string) {
    const type = getType(rawType);
    return `${type}/${SYMD.DUCKS}/${SYMD.ASYNC}/${SYMD.ERRORED}`;
}

export function createAsyncCanceledType(rawType: string) {
    const type = getType(rawType);
    return `${type}/${SYMD.DUCKS}/${SYMD.ASYNC}/${SYMD.CANCELED}`;
}

export function isDucksType(rawType: string) {
    return rawType.includes(SYMD.DUCKS);
}

export function isAsyncType(rawType: string) {
    return isDucksType(rawType) && rawType.includes(SYMD.ASYNC);
}

export function isAsyncRequestType(rawType: string) {
    return isDucksType(rawType) && isAsyncType(rawType) && rawType.includes(SYMD.REQUEST);
}

export function isAsyncRetryType(rawType: string) {
    return isDucksType(rawType) && isAsyncType(rawType) && rawType.includes(SYMD.RETRY);
}

export function isAsyncCancelType(rawType: string) {
    return isDucksType(rawType) && isAsyncType(rawType) && rawType.includes(SYMD.CANCEL);
}

export function isAsyncResolvedType(rawType: string) {
    return isDucksType(rawType) && isAsyncType(rawType) && rawType.includes(SYMD.RESOLVED);
}

export function isAsyncErroredType(rawType: string) {
    return isDucksType(rawType) && isAsyncType(rawType) && rawType.includes(SYMD.ERRORED);
}

export function isAsyncCanceledType(rawType: string) {
    return isDucksType(rawType) && isAsyncType(rawType) && rawType.includes(SYMD.CANCELED);
}

export function isAsyncRequestTypeOf(rawType: string) {
    return rawType === createAsyncRequestType(getType(rawType));
}

export function isAsyncRetryTypeOf(rawType: string) {
    return rawType === createAsyncRetryType(getType(rawType));
}

export function isAsyncCancelTypeOf(rawType: string) {
    return rawType === createAsyncCancelType(getType(rawType));
}

export function isAsyncResolvedTypeOf(rawType: string) {
    return rawType === createAsyncResolvedType(getType(rawType));
}

export function isAsyncErroredTypeOf(rawType: string) {
    return rawType === createAsyncErroredType(getType(rawType));
}

export function isAsyncCanceledTypeOf(rawType: string) {
    return rawType === createAsyncCanceledType(getType(rawType));
}

export function getCorrelationType(type: string) {
    return (action: ActionD<any>) => action.correlations && action.correlations.find(correlation => correlation.type === type);
}

export function getCorrelationId(id: string) {
    return (action: ActionD<any>) => action.correlations && action.correlations.find(correlation => correlation.id === id);
}

export function getCorrelation(correlationRef: CorrelationD) {
    return getCorrelationId(correlationRef.id);
}

export function hasCorrelationTypes(...types: string[]) {
    return (actions$: Actions<ActionD<any>>) => actions$.pipe(
        filter(action => action.correlations
            && types.every(type => action.correlations.some(correlation => correlation.type === type))
        )
    );
}

export function hasCorrelationIds(...ids: string[]) {
    return (actions$: Actions<ActionD<any>>) => actions$.pipe(
        filter(action => action.correlations
            && ids.every(id => action.correlations.some(correlation => correlation.id === id))
        )
    );
}

export function hasCorrelations(...correlations: CorrelationD[]) {
    return hasCorrelationIds(...correlations.map(correlation => correlation.id));
}

export function asyncResolvedOf(action: ActionD<any>) {
    const correlation = getCorrelationType(SYMD.ASYNC_CORRELATION)(action);
    return (actions$: Actions<ActionD<any>>) => actions$.pipe(
        hasCorrelationIds(correlation.id),
        filter(thisAction => isAsyncResolvedType(thisAction.type)),
        take(1)
    );
}

export function asyncErroredOf(action: ActionD<any>) {
    const correlation = getCorrelationType(SYMD.ASYNC_CORRELATION)(action);
    return (actions$: Actions<ActionD<any>>) => actions$.pipe(
        hasCorrelationIds(correlation.id),
        filter(thisAction => isAsyncErroredType(thisAction.type)),
        take(1)
    );
}

export function asyncCanceledOf(action: ActionD<any>) {
    const correlation = getCorrelationType(SYMD.ASYNC_CORRELATION)(action);
    return (actions$: Actions<ActionD<any>>) => actions$.pipe(
        hasCorrelationIds(correlation.id),
        filter(thisAction => isAsyncCanceledType(thisAction.type)),
        take(1)
    );
}

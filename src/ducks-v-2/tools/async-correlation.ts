import { SYMBOL } from '../enums/symbol';
import { Action } from '../classes/action';

/**
 * Is action's correlation containing type correlation
 */
export function hasCorrelationType(action: Action<any>, type: string) {
    return action
        && action.correlations
        && action.correlations
            .map(correlation => correlation.type)
            .includes(type);
}

/**
 * Get correlation type of action
 */
export function getCorrelationType(action: Action<any>, type: string) {
    return hasCorrelationType(action, type)
        ? action.correlations.find(correlation => correlation.type === type)
        : undefined;
}

/**
 * Is action's correlation containing id correlation
 */
export function hasCorrelationId(action: Action<any>, id: string) {
    return action
        && action.correlations
        && action.correlations
            .map(correlation => correlation.id)
            .includes(id);
}

/**
 * Get correlation type of action
 */
export function getCorrelationId(action: Action<any>, id: string) {
    return hasCorrelationId(action, id)
        ? action.correlations.find(correlation => correlation.id === id)
        : undefined;
}

/**
 * Get the base type
 */
export function baseType(rawType: string) {
    const parts = rawType.split(`/${SYMBOL.DUCKS}/`);
    return parts[0];
}

/**
 * Create request type of base type
 */
export function requestType(rawType: string) {
    const type = baseType(rawType);
    return `${type}/${SYMBOL.DUCKS}/${SYMBOL.ASYNC}/${SYMBOL.REQUEST}`;
}

/**
 * Create cancel type of base type
 */
export function cancelType(rawType: string) {
    const type = baseType(rawType);
    return `${type}/${SYMBOL.DUCKS}/${SYMBOL.ASYNC}/${SYMBOL.CANCEL}`;
}

/**
 * Create resolved type of base type
 */
export function resolvedType(rawType: string) {
    const type = baseType(rawType);
    return `${type}/${SYMBOL.DUCKS}/${SYMBOL.ASYNC}/${SYMBOL.RESOLVED}`;
}

/**
 * Create errored type of base type
 */
export function erroredType(rawType: string) {
    const type = baseType(rawType);
    return `${type}/${SYMBOL.DUCKS}/${SYMBOL.ASYNC}/${SYMBOL.ERRORED}`;
}

/**
 * Create canceled type of base type
 */
export function canceledType(rawType: string) {
    const type = baseType(rawType);
    return `${type}/${SYMBOL.DUCKS}/${SYMBOL.ASYNC}/${SYMBOL.CANCELED}`;
}

/**
 * Is rawType a ducks type
 */
export function isDucksType(rawType: string) {
    return rawType.includes(`/${SYMBOL.DUCKS}`);
}

/**
 * Is rawType an async type
 */
export function isAsyncType(rawType: string) {
    return isDucksType(rawType) && rawType.includes(`/${SYMBOL.ASYNC}`);
}

/**
 * Is rawType a request type
 */
export function isRequestType(rawType: string) {
    return isAsyncType(rawType) && rawType.includes(`/${SYMBOL.REQUEST}`);
}

/**
 * Is rawType a cancel type
 */
export function isCancelType(rawType: string) {
    return isAsyncType(rawType) && rawType.includes(`/${SYMBOL.CANCEL}`);
}

/**
 * Is rawType a resoloved type
 */
export function isResolvedType(rawType: string) {
    return isAsyncType(rawType) && rawType.includes(`/${SYMBOL.RESOLVED}`);
}

/**
 * Is rawType a errored type
 */
export function isErroredType(rawType: string) {
    return isAsyncType(rawType) && rawType.includes(`/${SYMBOL.ERRORED}`);
}

/**
 * Is rawType a canceled type
 */
export function isCanceledType(rawType: string) {
    return isAsyncType(rawType) && rawType.includes(`/${SYMBOL.CANCELED}`);
}

/**
 * Is rawType a request type of base type baseTypeRef
 */
export function isRequestTypeOf(basetypeRef: string, rawType) {
    return rawType.includes(basetypeRef) && isRequestType(rawType);
}

/**
 * Is rawType a cancel type of base type baseTypeRef
 */
export function isCancelTypeOf(basetypeRef: string, rawType) {
    return rawType.includes(basetypeRef) && isCancelType(rawType);
}

/**
 * Is rawType a resolved type of base type baseTypeRef
 */
export function isResolvedTypeOf(basetypeRef: string, rawType) {
    return rawType.includes(basetypeRef) && isResolvedType(rawType);
}

/**
 * Is rawType a errored type of base type baseTypeRef
 */
export function isErroredTypeOf(basetypeRef: string, rawType) {
    return rawType.includes(basetypeRef) && isErroredType(rawType);
}

/**
 * Is rawType a canceled type of base type baseTypeRef
 */
export function isCanceledTypeOf(basetypeRef: string, rawType) {
    return rawType.includes(basetypeRef) && isCanceledType(rawType);
}

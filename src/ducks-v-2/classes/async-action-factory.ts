import { ActionType } from '../types/action.type';
import { ActionConfig } from './action-config';
import { CorrelationType } from '../types/correlation.type';
import { Correlation } from './correlation';
import { Action } from './action';
import { SYMBOL } from '../enums/symbol';
import { requestType, cancelType, resolvedType, erroredType, canceledType } from '../tools/async-correlation';
import { DucksManager } from './ducks-manager';

export class AsyncActionFactory<Type extends ActionType<any, any>> {
    constructor(
        public ducks: DucksManager,
        public config: ActionConfig<Type>,
    ) {}

    createRequest(payload: Type['0'], correlations: CorrelationType[] = []) {
        const _correlations = correlations // this.config.options.correlations
            // .concat(correlations)
            .map(correlation => {
                if (typeof(correlation) === 'string') {
                    return new Correlation(correlation);
                } else if ((correlation as Correlation).id === undefined) {
                    return new Correlation(correlation.type, correlation.data);
                } else {
                    return correlation;
                }
            })
            .concat([new Correlation(SYMBOL.ASYNC_CORRELATION)]) as Correlation[];
        return new Action<Type['0']>(requestType(this.config.type), payload, _correlations);
    }

    createCancel(correlations: CorrelationType[]) {
        const _correlations = this.config.options.correlations
            .concat(correlations)
            .map(correlation => {
                if (typeof(correlation) === 'string') {
                    return new Correlation(correlation);
                } else if ((correlation as Correlation).id === undefined) {
                    return new Correlation(correlation.type, correlation.data);
                } else {
                    return correlation;
                }
            }) as Correlation[];
        return new Action<undefined>(cancelType(this.config.type), undefined, _correlations);
    }

    createResolved(payload: Type['1'], correlations: CorrelationType[]) {
        const _correlations = correlations // this.config.options.correlations
            // .concat(correlations)
            .map(correlation => {
                if (typeof(correlation) === 'string') {
                    return new Correlation(correlation);
                } else if ((correlation as Correlation).id === undefined) {
                    return new Correlation(correlation.type, correlation.data);
                } else {
                    return correlation;
                }
            }) as Correlation[];
        return new Action<Type['1']>(resolvedType(this.config.type), payload, _correlations);
    }

    createErrored(payload: { error: Error }, correlations: CorrelationType[]) {
        const _correlations = correlations // this.config.options.correlations
            // .concat(correlations)
            .map(correlation => {
                if (typeof(correlation) === 'string') {
                    return new Correlation(correlation);
                } else if ((correlation as Correlation).id === undefined) {
                    return new Correlation(correlation.type, correlation.data);
                } else {
                    return correlation;
                }
            }) as Correlation[];
        return new Action<{ error: Error }>(erroredType(this.config.type), payload, _correlations);
    }

    createCanceled(correlations: CorrelationType[]) {
        const _correlations = correlations // this.config.options.correlations
            // .concat(correlations)
            .map(correlation => {
                if (typeof(correlation) === 'string') {
                    return new Correlation(correlation);
                } else if ((correlation as Correlation).id === undefined) {
                    return new Correlation(correlation.type, correlation.data);
                } else {
                    return correlation;
                }
            }) as Correlation[];
        return new Action<undefined>(canceledType(this.config.type), undefined, _correlations);
    }

    dispatchRequest(payload: Type['0'], correlations: CorrelationType[] = []) {
        const action = this.createRequest(payload, correlations);
        this.ducks.store.dispatch(action);
        return action;
    }

    dispatchCancel(correlations: CorrelationType[]) {
        const action = this.createCancel(correlations);
        this.ducks.store.dispatch(action);
        return action;
    }

    /*
    dispatchResolved(payload: Type['1'], correlations: CorrelationType[]) {
        const action = this.createResolved(payload, correlations);
        this.ducks.store.dispatch(action);
        return action;
    }

    dispatchErrored(payload: { error: Error }, correlations: CorrelationType[]) {
        const action = this.createErrored(payload, correlations);
        this.ducks.store.dispatch(action);
        return action;
    }

    dispatchCanceled(correlations: CorrelationType[]) {
        const action = this.createCanceled(correlations);
        this.ducks.store.dispatch(action);
        return action;
    }
    */

}

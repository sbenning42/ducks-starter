import { ActionType } from '../types/action.type';
import { ActionConfig } from './action-config';
import { CorrelationType } from '../types/correlation.type';
import { Correlation } from './correlation';
import { Action } from './action';
import { SYMBOL } from '../enums/symbol';

export class AsyncActionFactory<Type extends ActionType<any, any>> {
    constructor(
        public config: ActionConfig<Type>,
    ) {}

    createRequest(payload: Type['0'], correlations: CorrelationType[] = []) {
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
            })
            .concat([new Correlation(SYMBOL.ASYNC_CORRELATION)]) as Correlation[];
        return new Action<Type['0']>(this.config.type, payload, _correlations);
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
        return new Action<undefined>(this.config.type, undefined, _correlations);
    }

    createResolved(payload: Type['1'], correlations: CorrelationType[]) {
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
        return new Action<Type['1']>(this.config.type, payload, _correlations);
    }

    createErrored(payload: { error: Error }, correlations: CorrelationType[]) {
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
        return new Action<{ error: Error }>(this.config.type, payload, _correlations);
    }

    createCanceled(correlations: CorrelationType[]) {
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
        return new Action<undefined>(this.config.type, undefined, _correlations);
    }

}

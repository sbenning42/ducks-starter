import { Correlation } from './correlation';

export class Action<Payload> {
    constructor(
        public type: string,
        public payload: Payload,
        public correlations: Correlation[],
    ) {}
}

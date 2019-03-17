import * as uuid from 'uuid/v4';

export class CorrelationD<Data = any> {
    id: string = uuid();
    constructor(
        public type: string,
        public data: Data = {} as any,
    ) {}
}

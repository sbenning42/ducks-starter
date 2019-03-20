import { uuid } from '../tools/uuid';

export class Correlation<Data = any> {
    id: string = uuid();
    constructor(
        public type: string,
        public data?: Data
    ) {}
}

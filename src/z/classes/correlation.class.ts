import { uuid } from "../functions/uuid.function";

export class Correlation<Data = any> {
    id = uuid();
    constructor(
        public type: string,
        public data?: Data,
    ) {}
}

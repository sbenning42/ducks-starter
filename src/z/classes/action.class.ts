import { Correlation } from "./correlation.class";
import { uuid } from "../functions/uuid.function";

export class Action<Payload = any> {
    id = uuid();
    constructor(
        public type: string,
        public payload: Payload,
        public correlations: Correlation[] = [],
    ) {}
}

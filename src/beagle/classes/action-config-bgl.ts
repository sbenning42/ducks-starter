import { Observable } from 'rxjs';

export class ActionConfigBGL<Payload, Result extends (Object|void) = void> {
  constructor(
    public type: string,
    public correlations: string[],
    public handler: (payload: Payload) => Result extends void ? void : Observable<Result>,
  ) {}
}

import * as uuid from 'uuid/v4';
import { CorrelationBGL } from './correlation-bgl';

export abstract class ActionBGL<Payload> {
  abstract type: string;
  id: string = uuid();
  correlations: CorrelationBGL[];
  constructor(public payload: Payload, correlations: (string | CorrelationBGL)[] = []) {
    this.correlations = correlations.map(correlation => typeof(correlation) === 'string' ? new CorrelationBGL(correlation) : correlation);
  }
}

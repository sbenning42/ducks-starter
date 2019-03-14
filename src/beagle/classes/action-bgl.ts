import * as uuid from 'uuid/v4';
import { CorrelationBGL } from './correlation-bgl';

export abstract class ActionBGL<Payload> {
  abstract type: string;
  id: string = uuid();
  correlations: CorrelationBGL[];
  constructor(public payload: Payload, correlations: (string | CorrelationBGL)[] = []) {
    this.correlations = correlations.length === 0 || typeof (correlations[0]) !== 'string'
      ? correlations as CorrelationBGL[]
      : correlations.map(correlation => new CorrelationBGL(correlation as string));
  }
}

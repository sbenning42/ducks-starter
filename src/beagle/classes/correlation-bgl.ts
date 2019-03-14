import * as uuid from 'uuid/v4';

export class CorrelationBGL {
  id: string = uuid();
  constructor(public type: string) {}
}

import * as uuid from 'uuid/v4';
import { ActionM } from '../interfaces/action-m';

export abstract class BaseActionM<P = any> implements ActionM<P> {
  abstract type: string;

  id: string = uuid();
  isAsync = false;
  constructor(
    public payload: P,
    public correlationId: string = uuid(),
  ) {}
}


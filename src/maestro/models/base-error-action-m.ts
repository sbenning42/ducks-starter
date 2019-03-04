import { ActionM } from '../interfaces/action-m';
import { errorType } from '../factories/base-types';

export class BaseErrorActionM {
  id: string;
  asyncId: string;
  correlationId: string;
  type: string;
  constructor(public payload: { error: Error }, action: ActionM) {
    this.id = action.id;
    this.asyncId = action.asyncId;
    this.correlationId = action.correlationId;
    this.type = errorType(action.type);
  }
}

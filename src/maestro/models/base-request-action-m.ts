import { ActionM } from '../interfaces/action-m';
import { requestType } from '../factories/base-types';

export class BaseRequestActionM<P = any> {
  id: string;
  asyncId: string;
  correlationId: string;
  type: string;
  payload: P;
  constructor(action: ActionM) {
    this.id = action.id;
    this.asyncId = action.asyncId;
    this.correlationId = action.correlationId;
    this.type = requestType(action.type);
    this.payload = action.payload;
  }
}

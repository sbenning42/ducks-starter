import { ActionM } from '../interfaces/action-m';
import { responseType } from '../factories/base-types';

export class BaseResponseActionM<P = any> {
  id: string;
  asyncId: string;
  correlationId: string;
  type: string;
  constructor(public payload: P, action: ActionM) {
    this.id = action.id;
    this.asyncId = action.asyncId;
    this.correlationId = action.correlationId;
    this.type = responseType(action.type);
  }
}

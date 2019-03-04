import { ActionM } from '../interfaces/action-m';
import { cancelType } from '../factories/base-types';

export class BaseCancelActionM {
  id: string;
  asyncId: string;
  correlationId: string;
  type: string;
  constructor(action: ActionM) {
    this.id = action.id;
    this.asyncId = action.asyncId;
    this.correlationId = action.correlationId;
    this.type = cancelType(action.type);
  }
}

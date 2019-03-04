import { ActionStateM } from '../interfaces/action-state-m';
import { ActionM } from '../interfaces/action-m';
import { STATUS_ACTION_STATE_M } from '../enums/status-action-state-m';

export class BaseActionStateM<P = any> implements ActionStateM<P, P> {
  type: string;
  id: string;
  correlationId: string;
  payload: P;
  result: P;
  isAsync = false;
  status: STATUS_ACTION_STATE_M = STATUS_ACTION_STATE_M.RESOLVED;
  constructor(action: ActionM) {
    this.type = action.type;
    this.id = action.id;
    this.payload = action.payload;
    this.result = action.payload;
    this.correlationId = action.correlationId;
  }
}

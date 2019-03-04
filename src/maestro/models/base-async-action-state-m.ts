import { ActionStateM } from '../interfaces/action-state-m';
import { ActionM } from '../interfaces/action-m';
import { STATUS_ACTION_STATE_M } from '../enums/status-action-state-m';

export class BaseAsyncActionStateM<P = any, R = any> implements ActionStateM<P, R> {
  type: string;
  id: string;
  asyncId: string;
  correlationId: string;
  payload: P;
  result: R;
  loading: boolean;
  loadingData: any;
  error: Error;
  isAsync = true;
  status: STATUS_ACTION_STATE_M = STATUS_ACTION_STATE_M.IDLE;
  constructor(action: ActionM) {
    this.type = action.type;
    this.id = action.id;
    this.asyncId = action.asyncId;
    this.correlationId = action.correlationId;
    this.payload = action.payload;
    this.loading = action.loading;
    this.loadingData = action.loadingData;
  }
}

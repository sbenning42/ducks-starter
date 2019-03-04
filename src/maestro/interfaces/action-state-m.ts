import { STATUS_ACTION_STATE_M } from '../enums/status-action-state-m';

export interface ActionStateM<P = any, R = any> {
  id: string;
  type: string;
  payload: P;
  result: R;
  isAsync: boolean;
  status: STATUS_ACTION_STATE_M;
  loading?: boolean;
  loadingData?: any;
  error?: Error;
  correlationId?: string;
  asyncId?: string;
}

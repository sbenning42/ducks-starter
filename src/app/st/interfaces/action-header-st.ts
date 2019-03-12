import { ActionCorrelationST } from './action-correlation-st';

export interface ActionHeaderST {
  type: string;
  id: string;
  correlations: ActionCorrelationST[];
}

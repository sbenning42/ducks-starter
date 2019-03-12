import { ActionCorrelationST } from './action-correlation-st';

export interface ActionHeaderFactoryConfigST {
  type: string;
  correlations?: ActionCorrelationST[];
}

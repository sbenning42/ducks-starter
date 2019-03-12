import { ActionCorrelationST } from './action-correlation-st';
import { ActionHeaderST } from './action-header-st';

export interface ActionFactoryConfigST<T = void> {
  header?: ActionHeaderST;
  type?: string;
  correlations?: ActionCorrelationST[];
  payload: T;
}

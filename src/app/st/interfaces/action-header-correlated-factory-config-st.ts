import { ActionHeaderST } from './action-header-st';

export interface ActionHeaderCorrelatedFactoryConfigST {
  type: string;
  correlationTypes: string[];
  header: ActionHeaderST;
}

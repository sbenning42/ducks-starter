import * as uuid from 'uuid/v4';
import { ActionHeaderST } from '../interfaces/action-header-st';
import { ActionCorrelationST } from '../interfaces/action-correlation-st';
import { ActionHeaderFactoryConfigST } from '../interfaces/action-header-factory-config-st';

export class ActionHeaderFactoryST implements ActionHeaderST {
  id: string = uuid();
  type: string;
  correlations: ActionCorrelationST[];
  constructor(config: ActionHeaderFactoryConfigST) {
    this.type = config.type;
    this.correlations = config.correlations || [];
  }
}

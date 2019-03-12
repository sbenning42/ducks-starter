import * as uuid from 'uuid/v4';
import { ActionHeaderST } from '../interfaces/action-header-st';
import { ActionCorrelationST } from '../interfaces/action-correlation-st';
import { ActionHeaderCorrelatedFactoryConfigST } from '../interfaces/action-header-correlated-factory-config-st';

export class ActionHeaderCorrelatedFactoryST implements ActionHeaderST {
  id: string = uuid();
  type: string;
  correlations: ActionCorrelationST[];
  constructor(config: ActionHeaderCorrelatedFactoryConfigST) {
    this.type = config.type;
    const configHasCorrelation = (correlation: ActionCorrelationST) => config.correlationTypes.includes(correlation.type);
    const eraseInitialFlag = (correlation: ActionCorrelationST) => ({ ...correlation, initial: false });
    this.correlations = config.header.correlations.filter(configHasCorrelation).map(eraseInitialFlag);
  }
}

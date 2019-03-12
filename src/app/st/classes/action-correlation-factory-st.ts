import * as uuid from 'uuid/v4';
import { ActionCorrelationFactoryConfigST } from '../interfaces/action-correlation-factory-config-st';
import { ActionCorrelationST } from '../interfaces/action-correlation-st';

export class ActionCorrelationFactoryST implements ActionCorrelationST {
  id: string;
  type: string;
  initial: boolean;
  final: boolean;
  constructor(config: ActionCorrelationFactoryConfigST) {
    this.id = config.id !== undefined ? config.id : uuid();
    this.type = config.type;
    this.initial = config.initial !== undefined ? config.initial : false;
    this.final = config.final !== undefined ? config.final : false;
  }
}

import { ActionST } from '../interfaces/action-st';
import { ActionHeaderST } from '../interfaces/action-header-st';
import { ActionHeaderFactoryST } from './action-header-factory-st';
import { ActionFactoryConfigST } from '../interfaces/action-factory-config-st';

export class ActionFactoryST<T = void> implements ActionST<T> {
  type: string;
  header: ActionHeaderST;
  payload: T;
  constructor(config: ActionFactoryConfigST<T>) {
    const header: ActionHeaderST = config.header
      ? config.header
      : new ActionHeaderFactoryST({ type: config.type, correlations: config.correlations });
    this.type = header.type;
    this.header = header;
    this.payload = config.payload;
  }
}

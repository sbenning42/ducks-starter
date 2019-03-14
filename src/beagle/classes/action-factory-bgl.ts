import { ActionConfigBGL } from './action-config-bgl';
import { ActionBGL } from './action-bgl';
import { CorrelationBGL } from './correlation-bgl';
import { Store } from '@ngrx/store';

export class ActionFactoryBGL<Payload> {
  constructor(public config: ActionConfigBGL<Payload, void>, private store: Store<any>) { }
  create(payload: Payload, correlations: (string | CorrelationBGL)[] = []): ActionBGL<Payload> {
    const config = this.config;
    return new class extends ActionBGL<Payload> {
      type = config.type;
    }(payload, correlations.concat(config.correlations));
  }
  dispatch(payload: Payload, correlations: (string | CorrelationBGL)[] = []): void {
    this.store.dispatch(this.create(payload, correlations));
  }
}

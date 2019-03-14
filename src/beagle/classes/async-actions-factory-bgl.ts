import { ActionConfigBGL } from './action-config-bgl';
import { ActionBGL } from './action-bgl';
import { CorrelationBGL } from './correlation-bgl';
import { Store } from '@ngrx/store';

export function makeRequestTypeBGL(type: string): string {
  return `${type} @ Request`;
}
export function makeCancelTypeBGL(type: string): string {
  return `${type} @ Cancel`;
}
export function makeRetryTypeBGL(type: string): string {
  return `${type} @ Retry`;
}
export function makeResolvedTypeBGL(type: string): string {
  return `${type} @ Resolved`;
}
export function makeErroredTypeBGL(type: string): string {
  return `${type} @ Errored`;
}
export function makeCanceledTypeBGL(type: string): string {
  return `${type} @ Canceled`;
}


export class AsyncActionFactoryBGL<Payload, Result> {
  constructor(public config: ActionConfigBGL<Payload, Result>, private store: Store<any>) { }
  createRequest(payload: Payload, correlations: (string | CorrelationBGL)[] = []): ActionBGL<Payload> {
    const config = this.config;
    return new class extends ActionBGL<Payload> {
      type = makeRequestTypeBGL(config.type);
    }(payload, correlations.concat(config.correlations));
  }
  createCancel({ correlations }: { correlations: CorrelationBGL[] }): ActionBGL<undefined> {
    const config = this.config;
    const correlation = correlations.find(c => c.type === 'async');
    return new class extends ActionBGL<undefined> {
      type = makeCancelTypeBGL(config.type);
    }(undefined, [correlation]);
  }
  createRetry(payload: Payload, { correlations }: { correlations: CorrelationBGL[] }): ActionBGL<Payload> {
    const config = this.config;
    const correlation = correlations.find(c => c.type === 'async');
    return new class extends ActionBGL<Payload> {
      type = makeRetryTypeBGL(config.type);
    }(payload, [correlation]);
  }
  createResolved(result: Result, { correlations }: { correlations: CorrelationBGL[] }): ActionBGL<Result> {
    const config = this.config;
    const correlation = correlations.find(c => c.type === 'async');
    return new class extends ActionBGL<Result> {
      type = makeResolvedTypeBGL(config.type);
    }(result, [correlation]);
  }
  createErrored(error: Error, { correlations }: { correlations: CorrelationBGL[] }): ActionBGL<{ error: Error }> {
    const config = this.config;
    const correlation = correlations.find(c => c.type === 'async');
    return new class extends ActionBGL<{ error: Error }> {
      type = makeErroredTypeBGL(config.type);
    }({ error }, [correlation]);
  }
  createCanceled({ correlations }: { correlations: CorrelationBGL[] }): ActionBGL<undefined> {
    const config = this.config;
    const correlation = correlations.find(c => c.type === 'async');
    return new class extends ActionBGL<undefined> {
      type = makeCanceledTypeBGL(config.type);
    }(undefined, [correlation]);
  }
  dispatchRequest(payload: Payload, correlations: (string | CorrelationBGL)[] = []) {
    this.store.dispatch(this.createRequest(payload, correlations));
  }
  dispatchCancel({ correlations }: { correlations: CorrelationBGL[] }) {
    this.store.dispatch(this.createCancel({ correlations }));
  }
}

import { ActionConfigBGL } from './action-config-bgl';
import { ActionBGL } from './action-bgl';
import { CorrelationBGL } from './correlation-bgl';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ofType, Actions } from '@ngrx/effects';
import { filter, mergeMap, takeWhile } from 'rxjs/operators';

export enum BeagleSym {
  beagle = 'beagle',
  async = 'async',
  request = 'request',
  cancel = 'cancel',
  retry = 'retry',
  resolved = 'resolved',
  errored = 'errored',
  canceled = 'canceled',
}

export function makeRequestTypeBGL(rawType: string): string {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return `${type}/${BeagleSym.beagle}/${BeagleSym.async}/${BeagleSym.request}`;
}
export function makeCancelTypeBGL(rawType: string): string {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return `${type}/${BeagleSym.beagle}/${BeagleSym.async}/${BeagleSym.cancel}`;
}
export function makeRetryTypeBGL(rawType: string): string {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return `${type}/${BeagleSym.beagle}/${BeagleSym.async}/${BeagleSym.retry}`;
}
export function makeResolvedTypeBGL(rawType: string): string {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return `${type}/${BeagleSym.beagle}/${BeagleSym.async}/${BeagleSym.resolved}`;
}
export function makeErroredTypeBGL(rawType: string): string {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return `${type}/${BeagleSym.beagle}/${BeagleSym.async}/${BeagleSym.errored}`;
}
export function makeCanceledTypeBGL(rawType: string): string {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return `${type}/${BeagleSym.beagle}/${BeagleSym.async}/${BeagleSym.canceled}`;
}

export function ofRequestType(rawType: string) {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return <A extends { type: string }>(actions$: Observable<A>) => actions$.pipe(
    ofType(makeRequestTypeBGL(type)),
  );
}
export function ofCancelType(rawType: string) {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return <A extends { type: string }>(actions$: Observable<A>) => actions$.pipe(
    ofType(makeCancelTypeBGL(type)),
  );
}
export function ofRetryType(rawType: string) {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return <A extends { type: string }>(actions$: Observable<A>) => actions$.pipe(
    ofType(makeRetryTypeBGL(type)),
  );
}
export function ofResolvedType(rawType: string) {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return <A extends { type: string }>(actions$: Observable<A>) => actions$.pipe(
    ofType(makeResolvedTypeBGL(type)),
  );
}
export function ofErroredType(rawType: string) {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return <A extends { type: string }>(actions$: Observable<A>) => actions$.pipe(
    ofType(makeErroredTypeBGL(type)),
  );
}
export function ofCanceledType(rawType: string) {
  const type = rawType.includes(`/${BeagleSym.beagle}/`) ? rawType.split(`/${BeagleSym.beagle}/`)[0].trim() : rawType;
  return <A extends { type: string }>(actions$: Observable<A>) => actions$.pipe(
    ofType(makeCanceledTypeBGL(type)),
  );
}


export class AsyncActionFactoryBGL<Payload, Result> {
  constructor(public config: ActionConfigBGL<Payload, Result>, private store: Store<any>) { }
  createRequest(payload: Payload, correlations: (string | CorrelationBGL)[] = []): ActionBGL<Payload> {
    const config = this.config;
    return new class extends ActionBGL<Payload> {
      type = makeRequestTypeBGL(config.type);
    }(payload, correlations.concat(config.correlations));
  }
  createCancel({ correlations }: { correlations: CorrelationBGL[] }, _correlations: (string | CorrelationBGL)[] = []): ActionBGL<undefined> {
    const config = this.config;
    const correlation = correlations.find(c => c.type === 'async');
    return new class extends ActionBGL<undefined> {
      type = makeCancelTypeBGL(config.type);
    }(undefined, [correlation, ..._correlations]);
  }
  createRetry(payload: Payload, { correlations }: { correlations: CorrelationBGL[] }, _correlations: (string | CorrelationBGL)[] = []): ActionBGL<Payload> {
    const config = this.config;
    const correlation = correlations.find(c => c.type === 'async');
    return new class extends ActionBGL<Payload> {
      type = makeRetryTypeBGL(config.type);
    }(payload, [correlation, ..._correlations]);
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
    }({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }, [correlation]);
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

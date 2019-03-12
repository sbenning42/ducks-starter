import * as uuid from 'uuid/v4';
import { FluxTaskConfig } from '../interfaces/flux-task-config';
import { IFluxSyncTask } from '../interfaces/i-flux-sync-task';
import { FluxAction } from '../interfaces/flux-action';
import { IFluxDecoredSyncTask } from '../interfaces/i-flux-decored-sync-task';
import { IFluxAsyncTask } from '../interfaces/i-flux-async-task';
import { IFluxDecoredAsyncTask } from '../interfaces/i-flux-decored-async-task';

export function FluxSyncTask<P = void>(config?: FluxTaskConfig) {
  return (constructor: new (...args: any[]) => IFluxSyncTask<P>) => {
    return class extends constructor implements IFluxDecoredSyncTask<P> {
      config = { ...config, isAsync: false };
      factory(payload?: P): FluxAction<P> {
        return { id: uuid(), type: config.type, config: this.config, payload };
      }
      dispatch(payload?: P): FluxAction<P> {
        const action = this.factory(payload);
        /** @TODO: dispatch action */
        console.log('/** @TODO: dispatch action */ ===>>> ', action);
        return action;
      }
    };
  };
}

export function FluxAsyncTask<P = void, R = void>(config?: FluxTaskConfig) {
  return (constructor: new (...args: any[]) => IFluxAsyncTask<P, R>) => {
    return class extends constructor implements IFluxDecoredAsyncTask<P, R> {
      config = { ...config, isAsync: true };
      factory(payload?: P): FluxAction<P> {
        return { id: uuid(), type: config.type, config: this.config, payload };
      }
      dispatch(payload?: P): FluxAction<P> {
        const action = this.factory(payload);
        /** @TODO: dispatch action */
        console.log('/** @TODO: dispatch action */ ===>>> ', action);
        return action;
      }
    };
  };
}

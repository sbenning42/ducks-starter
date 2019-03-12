import { FluxAction } from './flux-action';
import { FluxTaskConfig } from './flux-task-config';

export interface IFluxDecoredSyncTask<P = void> {
  config: FluxTaskConfig;
  factory(payload?: P): FluxAction<P>;
  dispatch(payload?: P): FluxAction<P>;
  sync(payload?: P): void;
}

import { FluxAction } from './flux-action';
import { FluxTaskConfig } from './flux-task-config';
import { Observable } from 'rxjs';

export interface IFluxDecoredAsyncTask<P = void, R = void> {
  config: FluxTaskConfig;
  factory(payload?: P): FluxAction<P>;
  dispatch(payload?: P): FluxAction<P>;
  async(payload?: P): Observable<R>;
}

import { FluxTaskConfig } from './flux-task-config';

export interface FluxAction<P = any> {
  id: string;
  type: string;
  config?: FluxTaskConfig;
  payload?: P;
}

import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ZenTaskState } from '../interfaces/zen-task-state';

export const zenStateSelector = 'zen';

export interface ZenState {
  tasks: EntityState<ZenTaskState>;
}

export const zenStateTasksAdapter = createEntityAdapter<ZenTaskState>();

export const initialZenState: ZenState = {
  tasks: zenStateTasksAdapter.getInitialState()
};

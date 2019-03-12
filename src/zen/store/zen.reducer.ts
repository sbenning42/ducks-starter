import { ZenState, initialZenState, zenStateTasksAdapter } from './zen.state';
import { ZenActions, ZenActionType, AddZenTaskState, UpdateZenTaskState, RemoveZenTaskState } from './zen.actions';

export function zenStateReducer(state: ZenState = initialZenState, action: ZenActions): ZenState {
  switch (action.type) {
    case ZenActionType.add:
      return { ...state, tasks: zenStateTasksAdapter.addOne((action as AddZenTaskState).payload.task, state.tasks) };
    case ZenActionType.update:
      return { ...state, tasks: zenStateTasksAdapter.updateOne((action as UpdateZenTaskState).payload.update, state.tasks) };
    case ZenActionType.remove:
      return { ...state, tasks: zenStateTasksAdapter.removeOne((action as RemoveZenTaskState).payload.id, state.tasks) };
    default:
      return state;
  }
}

import { ZenTaskState } from '../interfaces/zen-task-state';
import { Update } from '@ngrx/entity';

export enum ZenActionType {
  add = '[Zen Action Type] Add',
  update = '[Zen Action Type] Update',
  remove = '[Zen Action Type] Remove',
}

export class AddZenTaskState {
  type = ZenActionType.add;
  constructor(public payload: { task: ZenTaskState }) {}
}

export class UpdateZenTaskState {
  type = ZenActionType.update;
  constructor(public payload: { update: Update<ZenTaskState> }) {}
}

export class RemoveZenTaskState {
  type = ZenActionType.remove;
  constructor(public payload: { id: string }) {}
}

export type ZenActions = AddZenTaskState | UpdateZenTaskState | RemoveZenTaskState;

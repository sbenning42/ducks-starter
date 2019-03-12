import { ZenTaskStatus } from '../enums/zen-task-status';

export interface ZenTaskState {
  type: string;
  id: string;
  status: ZenTaskStatus;
}
